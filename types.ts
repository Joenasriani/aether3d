export enum PolyCount {
  LOW = 'Low',
  MEDIUM = 'Medium',
  HIGH = 'High'
}

export enum ExportFormat {
  GLB = 'glb',
  OBJ = 'obj',
  FBX = 'fbx'
}

export type ShapeType = 'box' | 'sphere' | 'cylinder' | 'torus' | 'cone' | 'capsule' | 'dodecahedron';

export interface AssetParams {
  id: string;
  shape: ShapeType;
  color: string;
  roughness: number;
  metalness: number;
  scale: [number, number, number];
  name: string;
  description: string;
  textureBase64?: string; // If generated
}

export interface UserState {
  isPro: boolean;
  credits: number;
}

export interface GenerationConfig {
  prompt: string;
  polyCount: PolyCount;
  includeTexture: boolean;
}