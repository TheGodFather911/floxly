const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID;
const CLIENT_SECRET = import.meta.env.VITE_SPOTIFY_CLIENT_SECRET;
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI;

export interface SpotifyTrack {
  id: string;
  name: string;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
  duration_ms: number;
  preview_url: string | null;
}

export interface SpotifyPlaylist {
  id: string;
  name: string;
  description: string;
  images: { url: string }[];
  tracks: {
    total: number;
  };
}

export interface SpotifyUser {
  id: string;
  display_name: string;
  images: { url: string }[];
}

export class SpotifyService {
  private static instance: SpotifyService;
  private accessToken: string | null = null;
  private refreshToken: string | null = null;
  private player: any = null;

  static getInstance(): SpotifyService {
    if (!SpotifyService.instance) {
      SpotifyService.instance = new SpotifyService();
    }
    return SpotifyService.instance;
  }

  constructor() {
    this.loadTokensFromStorage();
  }

  private loadTokensFromStorage() {
    this.accessToken = localStorage.getItem('spotify_access_token');
    this.refreshToken = localStorage.getItem('spotify_refresh_token');
  }

  private saveTokensToStorage(accessToken: string, refreshToken?: string) {
    this.accessToken = accessToken;
    localStorage.setItem('spotify_access_token', accessToken);
    
    if (refreshToken) {
      this.refreshToken = refreshToken;
      localStorage.setItem('spotify_refresh_token', refreshToken);
    }
  }

  getAuthUrl(): string {
    if (!CLIENT_ID) {
      throw new Error('Spotify Client ID not configured');
    }

    const scopes = [
      'user-read-private',
      'user-read-email',
      'playlist-read-private',
      'playlist-read-collaborative',
      'streaming',
      'user-read-playback-state',
      'user-modify-playback-state'
    ].join(' ');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: CLIENT_ID,
      scope: scopes,
      redirect_uri: REDIRECT_URI,
      show_dialog: 'true'
    });

    return `https://accounts.spotify.com/authorize?${params.toString()}`;
  }

  async exchangeCodeForToken(code: string): Promise<void> {
    if (!CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('Spotify credentials not configured');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: REDIRECT_URI
      })
    });

    if (!response.ok) {
      throw new Error('Failed to exchange code for token');
    }

    const data = await response.json();
    this.saveTokensToStorage(data.access_token, data.refresh_token);
  }

  async refreshAccessToken(): Promise<void> {
    if (!this.refreshToken || !CLIENT_ID || !CLIENT_SECRET) {
      throw new Error('No refresh token available');
    }

    const response = await fetch('https://accounts.spotify.com/api/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        'Authorization': `Basic ${btoa(`${CLIENT_ID}:${CLIENT_SECRET}`)}`
      },
      body: new URLSearchParams({
        grant_type: 'refresh_token',
        refresh_token: this.refreshToken
      })
    });

    if (!response.ok) {
      throw new Error('Failed to refresh token');
    }

    const data = await response.json();
    this.saveTokensToStorage(data.access_token);
  }

  private async makeSpotifyRequest(endpoint: string, options: RequestInit = {}): Promise<any> {
    if (!this.accessToken) {
      throw new Error('Not authenticated with Spotify');
    }

    let response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
      ...options,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json',
        ...options.headers
      }
    });

    if (response.status === 401) {
      // Token expired, try to refresh
      await this.refreshAccessToken();
      response = await fetch(`https://api.spotify.com/v1${endpoint}`, {
        ...options,
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'Content-Type': 'application/json',
          ...options.headers
        }
      });
    }

    if (!response.ok) {
      throw new Error(`Spotify API error: ${response.status}`);
    }

    return response.json();
  }

  async getCurrentUser(): Promise<SpotifyUser> {
    return this.makeSpotifyRequest('/me');
  }

  async getUserPlaylists(): Promise<SpotifyPlaylist[]> {
    const response = await this.makeSpotifyRequest('/me/playlists?limit=50');
    return response.items;
  }

  async getPlaylistTracks(playlistId: string): Promise<SpotifyTrack[]> {
    const response = await this.makeSpotifyRequest(`/playlists/${playlistId}/tracks`);
    return response.items.map((item: any) => item.track);
  }

  async initializePlayer(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (window.Spotify) {
        this.setupPlayer(resolve, reject);
      } else {
        window.onSpotifyWebPlaybackSDKReady = () => {
          this.setupPlayer(resolve, reject);
        };

        const script = document.createElement('script');
        script.src = 'https://sdk.scdn.co/spotify-player.js';
        script.async = true;
        document.body.appendChild(script);
      }
    });
  }

  private setupPlayer(resolve: () => void, reject: (error: any) => void) {
    this.player = new window.Spotify.Player({
      name: 'Student Focus Hub',
      getOAuthToken: (cb: (token: string) => void) => {
        cb(this.accessToken!);
      },
      volume: 0.5
    });

    this.player.addListener('ready', ({ device_id }: { device_id: string }) => {
      console.log('Ready with Device ID', device_id);
      resolve();
    });

    this.player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
      console.log('Device ID has gone offline', device_id);
    });

    this.player.addListener('initialization_error', ({ message }: { message: string }) => {
      reject(new Error(message));
    });

    this.player.addListener('authentication_error', ({ message }: { message: string }) => {
      reject(new Error(message));
    });

    this.player.addListener('account_error', ({ message }: { message: string }) => {
      reject(new Error(message));
    });

    this.player.connect();
  }

  async playTrack(uri: string): Promise<void> {
    if (!this.player) {
      throw new Error('Player not initialized');
    }

    await this.makeSpotifyRequest('/me/player/play', {
      method: 'PUT',
      body: JSON.stringify({
        uris: [uri]
      })
    });
  }

  async pausePlayback(): Promise<void> {
    if (this.player) {
      await this.player.pause();
    }
  }

  async resumePlayback(): Promise<void> {
    if (this.player) {
      await this.player.resume();
    }
  }

  isAuthenticated(): boolean {
    return !!this.accessToken;
  }

  logout(): void {
    this.accessToken = null;
    this.refreshToken = null;
    localStorage.removeItem('spotify_access_token');
    localStorage.removeItem('spotify_refresh_token');
    
    if (this.player) {
      this.player.disconnect();
      this.player = null;
    }
  }
}

// Extend Window interface for Spotify SDK
declare global {
  interface Window {
    Spotify: any;
    onSpotifyWebPlaybackSDKReady: () => void;
  }
}