import React, { useState, useEffect } from 'react';
import { GraduationCap, Plus, Trash2, Save } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';

interface Course {
  id: string;
  name: string;
  credits: number;
  grade: string;
}

interface Semester {
  id: string;
  name: string;
  courses: Course[];
}

export function GPACalculator() {
  const { theme } = useTheme();
  const [semesters, setSemesters] = useState<Semester[]>([]);
  const [currentSemester, setCurrentSemester] = useState('');

  useEffect(() => {
    const saved = localStorage.getItem('studentHub_gpa');
    if (saved) {
      try {
        setSemesters(JSON.parse(saved));
      } catch (e) {
        console.error('Error loading GPA data:', e);
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('studentHub_gpa', JSON.stringify(semesters));
  }, [semesters]);

  const gradePoints: Record<string, number> = {
    'A+': 4.0, 'A': 4.0, 'A-': 3.7,
    'B+': 3.3, 'B': 3.0, 'B-': 2.7,
    'C+': 2.3, 'C': 2.0, 'C-': 1.7,
    'D+': 1.3, 'D': 1.0, 'F': 0.0
  };

  const calculateSemesterGPA = (courses: Course[]) => {
    if (courses.length === 0) return 0;
    
    const totalPoints = courses.reduce((sum, course) => {
      return sum + (gradePoints[course.grade] || 0) * course.credits;
    }, 0);
    
    const totalCredits = courses.reduce((sum, course) => sum + course.credits, 0);
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const calculateOverallGPA = () => {
    let totalPoints = 0;
    let totalCredits = 0;
    
    semesters.forEach(semester => {
      semester.courses.forEach(course => {
        totalPoints += (gradePoints[course.grade] || 0) * course.credits;
        totalCredits += course.credits;
      });
    });
    
    return totalCredits > 0 ? totalPoints / totalCredits : 0;
  };

  const addSemester = () => {
    if (!currentSemester.trim()) return;
    
    const newSemester: Semester = {
      id: Date.now().toString(),
      name: currentSemester,
      courses: []
    };
    
    setSemesters([...semesters, newSemester]);
    setCurrentSemester('');
  };

  const addCourse = (semesterId: string) => {
    const newCourse: Course = {
      id: Date.now().toString(),
      name: '',
      credits: 3,
      grade: 'A'
    };
    
    setSemesters(semesters.map(semester => 
      semester.id === semesterId 
        ? { ...semester, courses: [...semester.courses, newCourse] }
        : semester
    ));
  };

  const updateCourse = (semesterId: string, courseId: string, field: string, value: any) => {
    setSemesters(semesters.map(semester =>
      semester.id === semesterId
        ? {
            ...semester,
            courses: semester.courses.map(course =>
              course.id === courseId ? { ...course, [field]: value } : course
            )
          }
        : semester
    ));
  };

  const deleteCourse = (semesterId: string, courseId: string) => {
    setSemesters(semesters.map(semester =>
      semester.id === semesterId
        ? { ...semester, courses: semester.courses.filter(course => course.id !== courseId) }
        : semester
    ));
  };

  const deleteSemester = (semesterId: string) => {
    setSemesters(semesters.filter(semester => semester.id !== semesterId));
  };

  return (
    <div className={`${theme.cardBackground} rounded-2xl p-6 shadow-xl`}>
      <div className="flex items-center gap-2 mb-4">
        <GraduationCap className={`w-5 h-5 ${theme.accent}`} />
        <h2 className={`text-lg font-semibold ${theme.text}`}>GPA Calculator</h2>
      </div>

      {/* Overall GPA Display */}
      <div className={`p-4 rounded-xl bg-gradient-to-r from-purple-500/20 to-pink-500/20 border ${theme.border} mb-6`}>
        <div className="text-center">
          <div className={`text-sm ${theme.textSecondary} mb-1`}>Overall GPA</div>
          <div className={`text-3xl font-bold ${theme.text}`}>
            {calculateOverallGPA().toFixed(2)}
          </div>
        </div>
      </div>

      {/* Add Semester */}
      <div className="flex gap-2 mb-4">
        <input
          type="text"
          value={currentSemester}
          onChange={(e) => setCurrentSemester(e.target.value)}
          placeholder="e.g., Fall 2024"
          className={`flex-1 p-2 rounded-lg bg-white/5 border ${theme.border} ${theme.text} placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500/50`}
        />
        <button
          onClick={addSemester}
          className={`p-2 rounded-lg ${theme.primary} ${theme.primaryHover} text-white transition-colors`}
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      {/* Semesters */}
      <div className="space-y-4 max-h-64 overflow-y-auto">
        {semesters.map((semester) => (
          <div key={semester.id} className={`p-4 rounded-xl bg-white/5 border ${theme.border}`}>
            <div className="flex items-center justify-between mb-3">
              <div>
                <h3 className={`font-semibold ${theme.text}`}>{semester.name}</h3>
                <span className={`text-sm ${theme.textSecondary}`}>
                  GPA: {calculateSemesterGPA(semester.courses).toFixed(2)}
                </span>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => addCourse(semester.id)}
                  className={`p-1 rounded ${theme.primary} ${theme.primaryHover} text-white`}
                >
                  <Plus className="w-3 h-3" />
                </button>
                <button
                  onClick={() => deleteSemester(semester.id)}
                  className="p-1 rounded bg-red-500 hover:bg-red-600 text-white"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            </div>

            {/* Courses */}
            <div className="space-y-2">
              {semester.courses.map((course) => (
                <div key={course.id} className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={course.name}
                    onChange={(e) => updateCourse(semester.id, course.id, 'name', e.target.value)}
                    placeholder="Course name"
                    className={`flex-1 p-1 text-xs rounded bg-white/10 ${theme.text} placeholder-gray-400`}
                  />
                  <input
                    type="number"
                    value={course.credits}
                    onChange={(e) => updateCourse(semester.id, course.id, 'credits', parseInt(e.target.value) || 0)}
                    className={`w-12 p-1 text-xs rounded bg-white/10 ${theme.text}`}
                    min="1"
                    max="6"
                  />
                  <select
                    value={course.grade}
                    onChange={(e) => updateCourse(semester.id, course.id, 'grade', e.target.value)}
                    className={`w-16 p-1 text-xs rounded bg-white/10 ${theme.text}`}
                  >
                    {Object.keys(gradePoints).map(grade => (
                      <option key={grade} value={grade} className="bg-gray-800">
                        {grade}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={() => deleteCourse(semester.id, course.id)}
                    className="p-1 rounded bg-red-500/20 text-red-400 hover:bg-red-500/30"
                  >
                    <Trash2 className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>

      {semesters.length === 0 && (
        <div className={`text-center py-8 ${theme.textSecondary}`}>
          <GraduationCap className="w-12 h-12 mx-auto mb-2 opacity-50" />
          <p>Add your first semester to start tracking your GPA</p>
        </div>
      )}
    </div>
  );
}