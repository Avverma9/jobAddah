// tailwind.config.js
module.exports = {
  theme: {
    extend: {
      keyframes: {
        "spin-slow": { to: { transform: "rotate(360deg)" } },
        "spin-reverse": { to: { transform: "rotate(-360deg)" } },
        floaty: {
          "0%,100%": { transform: "translateY(0px)" },
          "50%": { transform: "translateY(-10px)" },
        },
        "pulse-glow-light": {
          "0%,100%": {
            opacity: "0.8",
            transform: "scale(1)",
            boxShadow: "0 0 15px 5px rgba(99,102,241,0.25)",
          },
          "50%": {
            opacity: "1",
            transform: "scale(1.12)",
            boxShadow: "0 0 25px 8px rgba(99,102,241,0.5)",
          },
        },
      },
      animation: {
        "spin-slow": "spin-slow 3s linear infinite",
        "spin-reverse": "spin-reverse 2s linear infinite",
        floaty: "floaty 3s ease-in-out infinite",
        "pulse-glow-light": "pulse-glow-light 2s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};
