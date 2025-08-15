# React + Three.js + Tailwind CSS + React Three Fiber

A modern 3D web application built with React, Three.js, React Three Fiber, and Tailwind CSS.

## Features

- ⚛️ **React 18** - Latest React with modern hooks
- 🎨 **Tailwind CSS** - Utility-first CSS framework
- 🌟 **Three.js** - 3D graphics library
- 🔗 **React Three Fiber** - React renderer for Three.js
- 🛠️ **React Three Drei** - Useful helpers for R3F
- ⚡ **Vite** - Fast build tool and dev server
- 🔧 **ESLint** - Code linting

## Getting Started

### Prerequisites

Make sure you have Node.js installed (version 16 or higher recommended).

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Start the development server:**
   ```bash
   npm run dev
   ```

3. **Open your browser:**
   Navigate to `http://localhost:5173` to see your 3D application.

### Build for Production

```bash
npm run build
```

### Preview Production Build

```bash
npm run preview
```

## Project Structure

```
src/
├── components/
│   └── Scene.jsx          # 3D scene with animated objects
├── App.jsx                # Main app component
├── main.jsx               # React entry point
└── index.css              # Tailwind CSS imports

public/
└── vite.svg               # Favicon

Configuration files:
├── package.json           # Dependencies and scripts
├── vite.config.js         # Vite configuration
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
└── .eslintrc.cjs          # ESLint configuration
```

## What's Included

### 3D Scene Features

- **Rotating Boxes** - Animated cubes with different rotation speeds
- **Floating Spheres** - Spheres with sin-wave animation
- **Spinning Torus** - Rotating torus shape
- **Interactive Camera** - OrbitControls for mouse interaction
- **Lighting & Shadows** - Realistic lighting with shadow mapping
- **Environment** - HDR environment for reflections

### UI Components

- **Header** - Title and description
- **Controls Panel** - Instructions for camera interaction
- **Footer** - Technology credits
- **Responsive Design** - Works on desktop and mobile

### Tailwind CSS Styling

- Gradient backgrounds
- Glass morphism effects (backdrop-blur)
- Responsive typography
- Modern shadows and spacing

## Customization

### Adding New 3D Objects

Edit `src/components/Scene.jsx` to add new Three.js objects:

```jsx
// Add to the Scene component
<Box position={[x, y, z]} args={[width, height, depth]}>
  <meshStandardMaterial color="red" />
</Box>
```

### Modifying Animations

Use the `useFrame` hook for custom animations:

```jsx
useFrame((state, delta) => {
  meshRef.current.rotation.y += delta
})
```

### Styling with Tailwind

Modify `src/App.jsx` to change the UI styling using Tailwind classes.

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Technologies Used

- [React](https://reactjs.org/) - UI library
- [Three.js](https://threejs.org/) - 3D graphics
- [React Three Fiber](https://docs.pmnd.rs/react-three-fiber) - React renderer for Three.js
- [React Three Drei](https://github.com/pmndrs/drei) - Helpers for R3F
- [Tailwind CSS](https://tailwindcss.com/) - CSS framework
- [Vite](https://vitejs.dev/) - Build tool

## License

MIT License - feel free to use this project as a starting point for your own 3D web applications!
