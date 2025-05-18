// map-specification.ts    
import Painting from "./painting";    
import param from "./config.js";    
    
const USE_SPIRAL_MODE = true;


export interface MapFeature {    
  type: 'mountain' | 'ocean' | 'valley' | 'river';    
  position: {x: number, y: number};    
  radius?: number;    
  height?: number;    
  depth?: number;    
  path?: {x: number, y: number}[];    
  width?: number;    
}    
    
export interface MapSpecification {    
  mapName: string;    
  seed: number;    
  globalParameters: {    
    island: number;    
    noisy_coastlines: number;    
    mountain_sharpness: number;    
    ocean_depth: number;    
    [key: string]: number;    
  };    
  features: MapFeature[];    
}    
    
export function applyMapSpecification(spec: MapSpecification): void {    
  // Apply global parameters    
  param.elevation.seed = spec.seed;    
  param.elevation.island = spec.globalParameters.island;    
  param.elevation.noisy_coastlines = spec.globalParameters.noisy_coastlines;    
  param.elevation.mountain_sharpness = spec.globalParameters.mountain_sharpness;    
  param.elevation.ocean_depth = spec.globalParameters.ocean_depth;    
      
  // Apply other global parameters if they exist    
  for (const [key, value] of Object.entries(spec.globalParameters)) {    
    if (param.elevation[key] !== undefined) {    
      param.elevation[key] = value;    
    }    
  }    
      
  // Reset the painting canvas    
  Painting.resetCanvas();    
      
  // Apply each feature    
  for (const feature of spec.features) {    
    applyFeature(feature);    
  }    
      
  // Trigger map generation    
  Painting.onUpdate();    
}    
    
function applyFeature(feature: MapFeature): void {
  const TOOLS = {
    ocean:    { elevation: -0.25 },
    shallow:  { elevation: -0.05 },
    valley:   { elevation: +0.05 },
    mountain: { elevation: +1.0 }
  };

  let tool;
  switch (feature.type) {
    case 'mountain':
    case 'ocean':
    case 'valley':
      tool = TOOLS[feature.type];
      break;
    case 'river':
      if (feature.path && feature.path.length >= 2) {
        simulateRiverDrag(feature, TOOLS.valley);
        return;
      } else {
        return;
      }
    default:
      console.error(`Unknown feature type: ${feature.type}`);
      return;
  }

  if (USE_SPIRAL_MODE) {
    simulateFeatureDrag(feature, tool);
  } else {
    // 單點塗刷模式
    const size = getSizeForRadius(feature.radius || 0.1);
    Painting.paintAt(tool, feature.position.x, feature.position.y, size, 300);
  }
}

  
// Function to simulate dragging for a single feature  
function simulateFeatureDrag(feature: MapFeature, tool: { elevation: number }): void {  
  const size = getSizeForRadius(feature.radius || 0.1);  
  const center = feature.position;  
  const timePerPoint = 300; // 增加時間參數  
    
  // 增加點的數量  
  const numPoints = 50;   
  const spiralPoints = generateSpiralPoints(center, feature.radius || 0.1, numPoints);  
    
  console.log(`Simulating drag for ${feature.type} at (${center.x}, ${center.y}) with ${numPoints} points`);  
    
  // 多次應用以增強效果  
  for (let repeat = 0; repeat < 3; repeat++) {  
    for (let i = 0; i < spiralPoints.length; i++) {  
      const point = spiralPoints[i];  
      Painting.paintAt(  
        tool,  
        point.x,  
        point.y,  
        size,  
        timePerPoint  
      );  
    }  
  }  
    
  // 在特徵周圍添加額外的點以擴大影響範圍  
  if (feature.radius && feature.radius > 0.2) {  
    const outerRadius = feature.radius * 1.5;  
    const outerPoints = generateSpiralPoints(center, outerRadius, numPoints);  
      
    for (let i = 0; i < outerPoints.length; i++) {  
      const point = outerPoints[i];  
      Painting.paintAt(  
        tool,  
        point.x,  
        point.y,  
        size,  
        timePerPoint / 2 // 外圍點使用較小的時間參數  
      );  
    }  
  }  
}

  
// Function to simulate dragging for a river path  
function simulateRiverDrag(feature: MapFeature, tool: { elevation: number }): void {  
  if (!feature.path || feature.path.length < 2) return;  
    
  const riverSize = getSizeForRadius(feature.width || 0.02);  
  const timePerPoint = 100; // Time in ms for each point  
    
  // For each segment of the river path  
  for (let i = 0; i < feature.path.length - 1; i++) {  
    const start = feature.path[i];  
    const end = feature.path[i + 1];  
      
    // Create intermediate points between start and end to simulate dragging  
    const numIntermediatePoints = 10;  
    const intermediatePoints = generateIntermediatePoints(start, end, numIntermediatePoints);  
      
    console.log(`Simulating river segment from (${start.x}, ${start.y}) to (${end.x}, ${end.y}) with ${numIntermediatePoints} points`);  
      
    // Apply paint at each intermediate point  
    for (let j = 0; j < intermediatePoints.length; j++) {  
      const point = intermediatePoints[j];  
      Painting.paintAt(  
        tool,  
        point.x,  
        point.y,  
        riverSize,  
        timePerPoint  
      );  
    }  
  }  
}  
  
// Generate points in a spiral pattern around a center point  
function generateSpiralPoints(center: {x: number, y: number}, radius: number, numPoints: number): {x: number, y: number}[] {  
  const points: {x: number, y: number}[] = [];  
    
  // Start with the center point  
  points.push({x: center.x, y: center.y});  
    
  // Generate spiral points  
  for (let i = 1; i < numPoints; i++) {  
    // Calculate angle and distance from center  
    const angle = (i / numPoints) * Math.PI * 10; // Multiple rotations  
    const distance = (i / numPoints) * radius;  
      
    // Calculate point coordinates  
    const x = center.x + Math.cos(angle) * distance;  
    const y = center.y + Math.sin(angle) * distance;  
      
    points.push({x, y});  
  }  
    
  return points;  
}  
  
// Generate intermediate points between two points  
function generateIntermediatePoints(start: {x: number, y: number}, end: {x: number, y: number}, numPoints: number): {x: number, y: number}[] {  
  const points: {x: number, y: number}[] = [];  
    
  for (let i = 0; i <= numPoints; i++) {  
    const t = i / numPoints;  
    const x = start.x + (end.x - start.x) * t;  
    const y = start.y + (end.y - start.y) * t;  
    points.push({x, y});  
  }  
    
  return points;  
}  
  
function getSizeForRadius(radius: number) {  
  // Convert radius to one of the predefined sizes    
  if (radius < 0.05) return { innerRadius: 3, outerRadius: 6, rate: 2.0 };    
  if (radius < 0.1) return { innerRadius: 6, outerRadius: 12, rate: 2.0 };    
  if (radius < 0.2) return { innerRadius: 12, outerRadius: 24, rate: 2.0 };   
  if (radius < 0.4) return { innerRadius: 24, outerRadius: 48, rate: 2.5 };  
  if (radius < 0.6) return { innerRadius: 48, outerRadius: 96, rate: 3.0 };  
  console.log(`Using large size for radius ${radius}`);   
  return { innerRadius: 96, outerRadius: 192, rate: 3.5 };    
}