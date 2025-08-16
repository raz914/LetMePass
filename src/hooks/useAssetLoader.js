import { useState, useEffect } from 'react'
import { useThree } from '@react-three/fiber'
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader'
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader'
import * as THREE from 'three'

// Define all game assets that need to be preloaded
const GAME_ASSETS = [
  // GLTF Models
  { type: 'gltf', url: './forGandalf.glb', name: 'gandalf' },
  { type: 'gltf', url: './catModel/somali_cat_animated_ver_1.2.glb', name: 'cat' },
  
  // Wolf FBX Models
  { type: 'fbx', url: './wolfModel/idleWolf.fbx', name: 'wolf_idle' },
  { type: 'fbx', url: './wolfModel/Angry.fbx', name: 'wolf_angry' },
  { type: 'fbx', url: './wolfModel/Waving.fbx', name: 'wolf_waving' },
  { type: 'fbx', url: './wolfModel/Defeated.fbx', name: 'wolf_defeated' },
  { type: 'fbx', url: './wolfModel/Sitting Dazed.fbx', name: 'wolf_dazed' },
  { type: 'fbx', url: './wolfModel/Sitting Idle.fbx', name: 'wolf_sitting' },
]

export function useAssetLoader() {
  const [progress, setProgress] = useState(0)
  const [loaded, setLoaded] = useState(0)
  const [total] = useState(GAME_ASSETS.length)
  const [isLoading, setIsLoading] = useState(true)
  const [assets, setAssets] = useState({})
  const [errors, setErrors] = useState([])

  const { gl } = useThree()

  useEffect(() => {
    const loadingManager = new THREE.LoadingManager()
    const gltfLoader = new GLTFLoader(loadingManager)
    const fbxLoader = new FBXLoader(loadingManager)
    
    let loadedCount = 0
    const loadedAssets = {}
    const loadingErrors = []

    // Configure loading manager callbacks
    loadingManager.onLoad = () => {
      console.log('🎮 All assets loaded successfully!')
      setAssets(loadedAssets)
      setIsLoading(false)
      setProgress(100)
    }

    loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
      const progressPercent = (itemsLoaded / itemsTotal) * 100
      setProgress(progressPercent)
      setLoaded(itemsLoaded)
      console.log(`📦 Loading progress: ${progressPercent.toFixed(1)}% (${itemsLoaded}/${itemsTotal})`)
    }

    loadingManager.onError = (url) => {
      console.error('❌ Failed to load asset:', url)
      const error = { url, message: 'Failed to load asset' }
      loadingErrors.push(error)
      setErrors([...loadingErrors])
    }

    // Load each asset
    const loadAsset = (asset) => {
      return new Promise((resolve, reject) => {
        const onLoad = (loadedAsset) => {
          loadedCount++
          loadedAssets[asset.name] = loadedAsset
          console.log(`✅ Loaded ${asset.name}: ${asset.url}`)
          resolve(loadedAsset)
        }

        const onError = (error) => {
          console.error(`❌ Error loading ${asset.name}:`, error)
          loadingErrors.push({ url: asset.url, message: error.message || 'Unknown error' })
          setErrors([...loadingErrors])
          reject(error)
        }

        if (asset.type === 'gltf') {
          gltfLoader.load(asset.url, onLoad, undefined, onError)
        } else if (asset.type === 'fbx') {
          fbxLoader.load(asset.url, onLoad, undefined, onError)
        }
      })
    }

    // Start loading all assets
    const loadAllAssets = async () => {
      console.log('🚀 Starting to load game assets...')
      
      try {
        await Promise.allSettled(
          GAME_ASSETS.map(asset => loadAsset(asset))
        )
      } catch (error) {
        console.error('🔥 Critical loading error:', error)
      }
    }

    loadAllAssets()

    // Cleanup function
    return () => {
      // Dispose of any resources if needed
      Object.values(loadedAssets).forEach(asset => {
        if (asset.scene) {
          asset.scene.traverse(child => {
            if (child.geometry) child.geometry.dispose()
            if (child.material) {
              if (Array.isArray(child.material)) {
                child.material.forEach(mat => mat.dispose())
              } else {
                child.material.dispose()
              }
            }
          })
        }
      })
    }
  }, [gl])

  return {
    progress,
    loaded,
    total,
    isLoading,
    assets,
    errors,
    // Helper functions
    getAsset: (name) => assets[name],
    hasErrors: errors.length > 0,
  }
}

export default useAssetLoader
