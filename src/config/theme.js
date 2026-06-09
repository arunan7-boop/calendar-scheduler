// Theme configuration for Calendr
// Single source of truth for colors, fonts, messaging

export const THEMES = {
  default: {
    name: 'Default',
    colors: {
      primary: '#6366f1',
      secondary: '#ec4899',
      accent: '#f59e0b',
      background: '#ffffff',
      surface: '#f3f4f6',
      text: '#1f2937',
      textLight: '#6b7280',
      border: '#e5e7eb'
    },
    fonts: {
      family: "'Roboto', system-ui, -apple-system, sans-serif",
      sizes: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
      weights: { light: 300, normal: 400, semibold: 600, bold: 700 }
    }
  },
  minimal: {
    name: 'Minimal',
    colors: {
      primary: '#1f2937',
      secondary: '#9ca3af',
      accent: '#6b7280',
      background: '#ffffff',
      surface: '#f9fafb',
      text: '#111827',
      textLight: '#6b7280',
      border: '#f3f4f6'
    },
    fonts: {
      family: "'Roboto', sans-serif",
      sizes: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
      weights: { light: 300, normal: 400, semibold: 600, bold: 700 }
    }
  },
  vibrant: {
    name: 'Vibrant',
    colors: {
      primary: '#ff006e',
      secondary: '#00f5ff',
      accent: '#ffbe0b',
      background: '#ffffff',
      surface: '#fff5f7',
      text: '#1a1a1a',
      textLight: '#555555',
      border: '#ffe0ec'
    },
    fonts: {
      family: "'Roboto', sans-serif",
      sizes: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
      weights: { light: 300, normal: 400, semibold: 600, bold: 700 }
    }
  },
  zen: {
    name: 'Zen',
    colors: {
      primary: '#10b981',
      secondary: '#34d399',
      accent: '#6ee7b7',
      background: '#ffffff',
      surface: '#f0fdf4',
      text: '#065f46',
      textLight: '#059669',
      border: '#d1fae5'
    },
    fonts: {
      family: "'Roboto', sans-serif",
      sizes: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
      weights: { light: 300, normal: 400, semibold: 600, bold: 700 }
    }
  },
  luxury: {
    name: 'Luxury',
    colors: {
      primary: '#1e1e1e',
      secondary: '#d4af37',
      accent: '#ffd700',
      background: '#ffffff',
      surface: '#f5f5f5',
      text: '#1a1a1a',
      textLight: '#666666',
      border: '#e0e0e0'
    },
    fonts: {
      family: "'Roboto', serif",
      sizes: { xs: '12px', sm: '14px', base: '16px', lg: '18px', xl: '20px', '2xl': '24px' },
      weights: { light: 300, normal: 400, semibold: 600, bold: 700 }
    }
  }
};

// Messaging/copy - can be swapped by org
export const COPY = {
  onboarding: {
    title: 'Complete Your Professional Profile',
    step1: {
      title: 'Basic Information',
      description: 'Tell us about your professional practice',
      inputs: {
        firstName: 'First Name',
        lastName: 'Last Name',
        companyName: 'Company/Practice Name',
        bio: 'Professional Bio',
        workAddress: 'Work Address',
        workPhone: 'Work Phone'
      }
    },
    step2: {
      title: 'Services',
      description: 'Select services you offer',
      addCustom: 'Add Custom Service',
      placeholder: 'Service name (e.g., "Couples Massage")'
    },
    step3: {
      title: 'Working Hours',
      description: 'Set your availability',
      notWorking: 'Not working today',
      breakTime: 'Add break time',
      startTime: 'Start time',
      endTime: 'End time',
      share: 'Share with team'
    },
    step4: {
      title: 'Gallery & Logo',
      description: 'Add up to 6 photos and a logo',
      uploadPhotos: 'Upload up to 6 photos',
      uploadLogo: 'Upload logo (optional)',
      dragDrop: 'Drag and drop images or click to select'
    }
  },
  buttons: {
    next: 'Next',
    back: 'Back',
    save: 'Save & Continue',
    complete: 'Complete Setup',
    skip: 'Skip for now'
  }
};

// Get theme by ID
export const getTheme = (themeId = 'default') => {
  return THEMES[themeId] || THEMES.default;
};

// Create CSS variables from theme
export const generateThemeCSS = (theme) => {
  return `
    :root {
      --color-primary: ${theme.colors.primary};
      --color-secondary: ${theme.colors.secondary};
      --color-accent: ${theme.colors.accent};
      --color-background: ${theme.colors.background};
      --color-surface: ${theme.colors.surface};
      --color-text: ${theme.colors.text};
      --color-text-light: ${theme.colors.textLight};
      --color-border: ${theme.colors.border};
      
      --font-family: ${theme.fonts.family};
      --font-size-xs: ${theme.fonts.sizes.xs};
      --font-size-sm: ${theme.fonts.sizes.sm};
      --font-size-base: ${theme.fonts.sizes.base};
      --font-size-lg: ${theme.fonts.sizes.lg};
      --font-size-xl: ${theme.fonts.sizes.xl};
      --font-size-2xl: ${theme.fonts.sizes['2xl']};
      
      --font-light: ${theme.fonts.weights.light};
      --font-normal: ${theme.fonts.weights.normal};
      --font-semibold: ${theme.fonts.weights.semibold};
      --font-bold: ${theme.fonts.weights.bold};
    }
  `;
};
