// src/theme/theme.js
export const theme = {
  colors: {
    // Brand Colors
    primary: '#4F46E5', // Indigo 600
    primaryLight: '#818CF8', // Indigo 400
    primaryDark: '#3730A3', // Indigo 800
    
    secondary: '#EC4899', // Pink 500
    accent: '#F59E0B', // Amber 500
    
    // Neutrals
    background: '#F8FAFC',
    surface: '#FFFFFF',
    text: '#0F172A', // Slate 900
    textSecondary: '#64748B', // Slate 500
    textMuted: '#94A3B8', // Slate 400
    
    // Status
    success: '#10B981',
    error: '#EF4444',
    warning: '#F59E0B',
    
    // Glassmorphism tokens
    glass: 'rgba(255, 255, 255, 0.7)',
    glassBorder: 'rgba(255, 255, 255, 0.5)',
    
    // Gradients
    gradients: {
      primary: ['#4F46E5', '#6366F1'],
      premium: ['#1E293B', '#0F172A'],
      rose: ['#F472B6', '#EC4899'],
      glass: ['rgba(255, 255, 255, 0.8)', 'rgba(255, 255, 255, 0.4)']
    }
  },
  spacing: {
    xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48
  },
  borderRadius: {
    xs: 8, sm: 12, md: 16, lg: 24, xl: 32, full: 9999
  },
  shadows: {
    soft: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.05,
      shadowRadius: 10,
      elevation: 3,
    },
    premium: {
      shadowColor: '#4F46E5',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.15,
      shadowRadius: 20,
      elevation: 10,
    }
  }
};
