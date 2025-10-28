// tailwind.config.js

tailwind.config = {
    theme: {
        extend: {
            // Aquí definimos tu color personalizado
            colors: {
                'custom-blue': '#224abe',
            },
            // Y aquí definimos tus animaciones
            animation: {
                'slideInFromLeft': 'slideInFromLeft 0.6s ease-out forwards',
                'slideInFromRight': 'slideInFromRight 0.6s ease-out forwards',
            },
            keyframes: {
                slideInFromLeft: {
                    '0%': { transform: 'translateX(-100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                },
                slideInFromRight: {
                    '0%': { transform: 'translateX(100%)', opacity: '0' },
                    '100%': { transform: 'translateX(0)', opacity: '1' },
                }
            }
        }
    }
}