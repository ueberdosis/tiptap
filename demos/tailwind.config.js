const defaultTheme = require('tailwindcss/defaultTheme')

module.exports = {
  mode: 'jit',
  purge: [
    './preview/**/*.{vue,js,ts,jsx,tsx}',
  ],

  theme: {
    extend: {
      colors: {
        code: {
          attrName: '#faf594',
          attrValue: '##b9f18d',
          doctype: '#616161',
          keyword: '##958df1',
          punctuation: '##70cff8',
          string: '#b9f18d',
          tag: '#f98181',
        },
        transparency: {
          box: {
            3: 'rgba(13, 13, 13, 0.03)',
            5: 'rgba(13, 13, 13, 0.05)',
          },
        },
        gray: {
          DEFAULT: '',
          900: '#0d0d0d',
          800: '#262626',
          700: '#3a3a3a',
          600: '#4e4e4e',
          500: '#616161',
          400: '#737373',
          300: '#919191',
          200: '#b3b3b3',
          100: '#d6d6d6',
          50: '#e8e8e8',
        },
        accent: {
          DEFAULT: '#faf594',
          50: '#fffffa',
          100: '#fffef4',
          200: '#fefde4',
          300: '#fdfbd4',
          400: '#fcf8b4',
          500: '#faf594',
          600: '#e1dd85',
          700: '#bcb86f',
          800: '#969359',
          900: '#7b7849',
        },
        success: {
          DEFAULT: '#b9f18d',
          50: '#fcfef9',
          100: '#f8fef4',
          200: '#eefce3',
          300: '#e3f9d1',
          400: '#cef5af',
          500: '#b9f18d',
          600: '#a7d97f',
          700: '#8bb56a',
          800: '#6f9155',
          900: '#5b7645',
        },
      },
      spacing: {},
      borderRadius: {
        xxs: '0.4rem',
        box: '0.75rem',
      },
      fontSize: {
        '2xl': '2.75rem',
        xl: '1.5rem',
        lg: '1.17rem',
        sm: '0.85rem',
      },
      lineHeight: {
        DEFAULT: '1.7rem',
        '2xl': '3.16rem',
        xl: '1.8rem',
        lg: '1.6rem',
      },
      transition: {},
      height: {
        18: '4.5rem',
      },
      padding: {
        18: '4.5rem',
      },
      zIndex: {},
      boxShadow: {},
      textShadow: {},
      fontFamily: {
        sans: ['Inter', ...defaultTheme.fontFamily.sans],
        mono: ['JetBrains Mono', ...defaultTheme.fontFamily.mono],
      },
    },
  },

  variants: {
    extend: {
      opacity: ['disabled'],
    },
  },
}
