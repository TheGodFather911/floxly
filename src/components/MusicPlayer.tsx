import React, { useState } from 'react';
import { Music, Play, Pause, SkipForward, Volume2, ExternalLink, LogIn, LogOut, User } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { SpotifyService, SpotifyPlaylist, SpotifyTrack, SpotifyUser } from '../services/spotifyService';

export function MusicPlayer() {
  const { theme } = useTheme();
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(75);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<SpotifyUser | null>(null);
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [selectedPlaylist, setSelectedPlaylist] = useState<SpotifyPlaylist | null>(null);
  const [playlistTracks, setPlaylistTracks] = useState<SpotifyTrack[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  const spotifyService = SpotifyService.getInstance();

  React.useEffect(() => {
    const checkAuth = async () => {
      if (spotifyService.isAuthenticated()) {
        try {
          const userData = await spotifyService.getCurrentUser();
          setUser(userData);
          setIsAuthenticated(true);
          loadPlaylists();
        } catch (err) {
          console.error('Failed to get user data:', err);
          setError('Failed to authenticate with Spotify');
        }
      }
    };

    checkAuth();

    // Handle OAuth callback
    const urlParams = new URLSearchParams(window.location.search);
    const code = urlParams.get('code');
    if (code) {
      handleAuthCallback(code);
    }
  }, []);

  const handleAuthCallback = async (code: string) => {
    try {
      setIsLoading(true);
      await spotifyService.exchangeCodeForToken(code);
      const userData = await spotifyService.getCurrentUser();
      setUser(userData);
      setIsAuthenticated(true);
      await loadPlaylists();
      
      // Clean up URL
      window.history.replaceState({}, document.title, window.location.pathname);
    } catch (err) {
      setError('Failed to authenticate with Spotify');
      console.error('Auth error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = () => {
    try {
      const authUrl = spotifyService.getAuthUrl();
      window.location.href = authUrl;
    } catch (err) {
      setError('Spotify credentials not configured. Please check your .env file.');
    }
  };

  const handleLogout = () => {
    spotifyService.logout();
    setIsAuthenticated(false);
    setUser(null);
    setPlaylists([]);
    setSelectedPlaylist(null);
    setPlaylistTracks([]);
    setCurrentTrack(null);
    setIsPlaying(false);
  };

  const loadPlaylists = async () => {
    try {
      setIsLoading(true);
      const userPlaylists = await spotifyService.getUserPlaylists();
      setPlaylists(userPlaylists);
    } catch (err) {
      setError('Failed to load playlists');
      console.error('Playlist error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const selectPlaylist = async (playlist: SpotifyPlaylist) => {
    try {
      setIsLoading(true);
      setSelectedPlaylist(playlist);
      const tracks = await spotifyService.getPlaylistTracks(playlist.id);
      setPlaylistTracks(tracks);
    } catch (err) {
      setError('Failed to load playlist tracks');
      console.error('Track loading error:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const playTrack = async (track: SpotifyTrack) => {
    try {
      if (!spotifyService.isAuthenticated()) {
        setError('Please login to Spotify first');
        return;
      }

      await spotifyService.playTrack(`spotify:track:${track.id}`);
      setCurrentTrack(track);
      setIsPlaying(true);
    } catch (err) {
      // Fallback to preview if available
      if (track.preview_url) {
        setCurrentTrack(track);
        setIsPlaying(true);
      } else {
        setError('Unable to play this track. Try opening it in Spotify.');
      }
    }
  };

  const togglePlayback = async () => {
    try {
      if (isPlaying) {
        await spotifyService.pausePlayback();
        setIsPlaying(false);
      } else {
        await spotifyService.resumePlayback();
        setIsPlaying(true);
      }
    } catch (err) {
      console.error('Playback error:', err);
    }
  };

  const spotifyPlaylists = [
    { name: 'Lo-fi Study Beats', url: 'https://open.spotify.com/playlist/37i9dQZF1DX0XUsuxWHRQd' },
    { name: 'Deep Focus', url: 'https://open.spotify.com/playlist/37i9dQZF1DWZeKCadgRdKQ' },
    { name: 'Peaceful Piano', url: 'https://open.spotify.com/playlist/37i9dQZF1DX4sWSpwq3LiO' },
    { name: 'Chill Instrumental', url: 'https://open.spotify.com/playlist/37i9dQZF1DX3Ogo9pFvBkY' }
  ];

  const youtubePlaylists = [
    { name: 'Study with Me - 2 Hours', url: 'https://www.youtube.com/watch?v=jfKfPfyJRdk' },
    { name: 'Ambient Study Music', url: 'https://www.youtube.com/watch?v=5qap5aO4i9A' },
    { name: 'Forest Sounds for Focus', url: 'https://www.youtube.com/watch?v=xNN7iTA57jM' }
  ];

  return (
    <div className={`${theme.cardBackground} rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center gap-2 mb-4">
        <Music className={`w-5 h-5 ${theme.accent}`} />
        <h2 className={`text-lg font-semibold ${theme.text}`}>Music Player</h2>
        {isAuthenticated && user && (
          <div className="ml-auto flex items-center gap-2">
            <div className="flex items-center gap-2">
              {user.images?.[0] && (
                <img 
                  src={user.images[0].url} 
                  alt={user.display_name}
                  className="w-6 h-6 rounded-full"
                />
              )}
              <span className={`text-sm ${theme.textSecondary}`}>{user.display_name}</span>
            </div>
            <button
              onClick={handleLogout}
              className={`p-1 rounded hover:bg-white/10 transition-colors ${theme.text}`}
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {error && (
        <div className="mb-4 p-3 rounded-lg bg-red-500/20 border border-red-500/30 text-red-400 text-sm">
          {error}
          <button 
            onClick={() => setError(null)}
            className="ml-2 underline hover:no-underline"
          >
            Dismiss
          </button>
        </div>
      )}

      {!isAuthenticated ? (
        <div className={`p-6 rounded-xl bg-white/5 border ${theme.border} text-center`}>
          <Music className={`w-12 h-12 mx-auto mb-4 ${theme.textSecondary}`} />
          <h3 className={`text-lg font-semibold ${theme.text} mb-2`}>Connect to Spotify</h3>
          <p className={`text-sm ${theme.textSecondary} mb-4`}>
            Login with your Spotify account to access your playlists and control playback
          </p>
          <button
            onClick={handleLogin}
            disabled={isLoading}
            className={`flex items-center gap-2 mx-auto px-4 py-2 rounded-xl bg-green-600 hover:bg-green-700 text-white transition-all hover:scale-105 disabled:opacity-50`}
          >
            <LogIn className="w-4 h-4" />
            {isLoading ? 'Connecting...' : 'Login with Spotify'}
          </button>
        </div>
      ) : (
        <>
      {/* Current Track Display */}
      <div className={`p-4 rounded-xl bg-white/5 border ${theme.border} mb-4`}>
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-lg ${currentTrack ? 'bg-cover bg-center' : theme.primary} flex items-center justify-center`}
                 style={currentTrack?.album.images?.[0] ? { backgroundImage: `url(${currentTrack.album.images[0].url})` } : {}}>
              {!currentTrack?.album.images?.[0] && <Music className="w-5 h-5 text-white" />}
            </div>
            <div>
              <div className={`font-medium ${theme.text}`}>
                {currentTrack ? currentTrack.name : 'No track selected'}
              </div>
              <div className={`text-xs ${theme.textSecondary}`}>
                {currentTrack ? currentTrack.artists.map(a => a.name).join(', ') : 'Ready to focus'}
              </div>
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.text}`}>
              <SkipForward className="w-4 h-4 rotate-180" />
            </button>
            <button 
              onClick={togglePlayback}
              className={`p-3 rounded-xl ${theme.primary} ${theme.primaryHover} text-white transition-all hover:scale-105`}
              disabled={!currentTrack}
            >
              {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
            </button>
            <button className={`p-2 rounded-lg hover:bg-white/10 transition-colors ${theme.text}`}>
              <SkipForward className="w-4 h-4" />
            </button>
          </div>

          <div className="flex items-center gap-2">
            <Volume2 className={`w-4 h-4 ${theme.textSecondary}`} />
            <input
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) => setVolume(parseInt(e.target.value))}
              className="w-16 h-1 bg-white/20 rounded-lg appearance-none cursor-pointer slider"
            />
          </div>
        </div>
      </div>

          {/* Your Spotify Playlists */}
          {playlists.length > 0 && (
            <div className="mb-4">
              <h3 className={`text-sm font-semibold ${theme.text} mb-2 flex items-center gap-1`}>
                <span className="text-green-400">Your</span> Playlists
              </h3>
              <div className="space-y-2 max-h-48 overflow-y-auto">
                {playlists.map((playlist) => (
                  <button
                    key={playlist.id}
                    onClick={() => selectPlaylist(playlist)}
                    className={`w-full flex items-center gap-3 p-3 rounded-lg hover:bg-white/10 transition-colors group ${theme.text} ${
                      selectedPlaylist?.id === playlist.id ? 'bg-white/10' : ''
                    }`}
                  >
                    {playlist.images?.[0] && (
                      <img 
                        src={playlist.images[0].url} 
                        alt={playlist.name}
                        className="w-8 h-8 rounded"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-sm font-medium">{playlist.name}</div>
                      <div className={`text-xs ${theme.textSecondary}`}>
                        {playlist.tracks.total} tracks
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Playlist Tracks */}
          {selectedPlaylist && playlistTracks.length > 0 && (
            <div className="mb-4">
              <h3 className={`text-sm font-semibold ${theme.text} mb-2`}>
                {selectedPlaylist.name} - Tracks
              </h3>
              <div className="space-y-1 max-h-48 overflow-y-auto">
                {playlistTracks.slice(0, 20).map((track) => (
                  <button
                    key={track.id}
                    onClick={() => playTrack(track)}
                    className={`w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors group ${theme.text} ${
                      currentTrack?.id === track.id ? 'bg-white/10' : ''
                    }`}
                  >
                    {track.album.images?.[0] && (
                      <img 
                        src={track.album.images[0].url} 
                        alt={track.album.name}
                        className="w-6 h-6 rounded"
                      />
                    )}
                    <div className="flex-1 text-left">
                      <div className="text-xs font-medium truncate">{track.name}</div>
                      <div className={`text-xs ${theme.textSecondary} truncate`}>
                        {track.artists.map(a => a.name).join(', ')}
                      </div>
                    </div>
                    {currentTrack?.id === track.id && isPlaying && (
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          )}
        </>
      )}

      {/* Fallback Playlists */}
      {!isAuthenticated && (
        <>
          {/* Spotify Playlists */}
          <div className="mb-4">
            <h3 className={`text-sm font-semibold ${theme.text} mb-2 flex items-center gap-1`}>
              <span className="text-green-400">Spotify</span> Study Playlists
            </h3>
            <div className="space-y-2">
              {spotifyPlaylists.map((playlist, index) => (
                <button
                  key={index}
                  onClick={() => window.open(playlist.url, '_blank')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors group ${theme.text}`}
                >
                  <span className="text-sm">{playlist.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>

          {/* YouTube Playlists */}
          <div>
            <h3 className={`text-sm font-semibold ${theme.text} mb-2 flex items-center gap-1`}>
              <span className="text-red-400">YouTube</span> Study Sessions
            </h3>
            <div className="space-y-2">
              {youtubePlaylists.map((playlist, index) => (
                <button
                  key={index}
                  onClick={() => window.open(playlist.url, '_blank')}
                  className={`w-full flex items-center justify-between p-3 rounded-lg hover:bg-white/10 transition-colors group ${theme.text}`}
                >
                  <span className="text-sm">{playlist.name}</span>
                  <ExternalLink className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                </button>
              ))}
            </div>
          </div>
        </>
      )}

      {isLoading && (
        <div className={`text-center py-4 ${theme.textSecondary}`}>
          <div className="animate-spin w-6 h-6 border-2 border-purple-500 border-t-transparent rounded-full mx-auto mb-2"></div>
          Loading...
        </div>
      )}
    </div>
  );
}