import { Canvas, useFrame, useLoader } from "@react-three/fiber";
import { OrbitControls, Stars, Html } from "@react-three/drei";
import { Suspense, useMemo, useRef } from "react";
import * as THREE from "three";
import type { Location } from "@/lib/data";

const TEX = "https://unpkg.com/three-globe@2.31.0/example/img/earth-blue-marble.jpg";
const BUMP = "https://unpkg.com/three-globe@2.31.0/example/img/earth-topology.png";
const MARKER: Record<string, string> = { lunar: "#3987FF", mars: "#FF9D4D", multi: "#45D6A0", pending: "#8a93a6" };

export function latLonToVec(lat: number, lon: number, r = 1.01) {
  const phi = ((90 - lat) * Math.PI) / 180;
  const theta = ((lon + 180) * Math.PI) / 180;
  return new THREE.Vector3(-r * Math.sin(phi) * Math.cos(theta), r * Math.cos(phi), r * Math.sin(phi) * Math.sin(theta));
}

function Earth({ locations, selected, onSelect, autoRotate }: Props) {
  const group = useRef<THREE.Group>(null);
  const [map, bump] = useLoader(THREE.TextureLoader, [TEX, BUMP]) as [THREE.Texture, THREE.Texture];
  map.colorSpace = THREE.SRGBColorSpace;
  const target = useRef<THREE.Quaternion | null>(null);
  const sel = locations.find((l) => l.id === selected);
  useMemo(() => {
    if (!sel) { target.current = null; return; }
    const v = latLonToVec(sel.lat, sel.lon, 1).normalize();
    target.current = new THREE.Quaternion().setFromUnitVectors(v, new THREE.Vector3(0, 0, 1));
  }, [sel]);
  useFrame((_, d) => {
    const g = group.current; if (!g) return;
    const dt = Math.min(d, 0.05);
    if (target.current) g.quaternion.slerp(target.current, 1 - Math.exp(-3 * dt));
    else if (autoRotate) g.rotation.y += dt * 0.08;
  });
  return (
    <group ref={group}>
      <mesh>
        <sphereGeometry args={[1, 96, 96]} />
        <meshStandardMaterial map={map} bumpMap={bump} bumpScale={0.03} roughness={0.85} />
      </mesh>
      {locations.map((l) => (
        <mesh key={l.id} position={latLonToVec(l.lat, l.lon)} onClick={(e) => { e.stopPropagation(); onSelect?.(l.id); }}
          onPointerOver={() => (document.body.style.cursor = "pointer")} onPointerOut={() => (document.body.style.cursor = "")}>
          <sphereGeometry args={[l.id === selected ? 0.028 : 0.018, 16, 16]} />
          <meshBasicMaterial color={MARKER[l.category] ?? "#888"} toneMapped={false} />
          {l.id === selected && (
            <Html distanceFactor={4} center style={{ pointerEvents: "none" }}>
              <div className="glass whitespace-nowrap px-2 py-1 text-xs translate-y-[-22px]">{l.name}</div>
            </Html>
          )}
        </mesh>
      ))}
    </group>
  );
}

function Atmosphere() {
  const mat = useMemo(() => new THREE.ShaderMaterial({
    vertexShader: `varying vec3 vN; void main(){ vN = normalize(normalMatrix*normal); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0);}`,
    fragmentShader: `varying vec3 vN; void main(){ float i = pow(0.7 - dot(vN, vec3(0,0,1.0)), 3.0); gl_FragColor = vec4(0.25,0.7,1.0,1.0)*i; }`,
    blending: THREE.AdditiveBlending, side: THREE.BackSide, transparent: true,
  }), []);
  return <mesh scale={1.15} material={mat}><sphereGeometry args={[1, 64, 64]} /></mesh>;
}

function Body({ pos, color, size }: { pos: [number, number, number]; color: string; size: number }) {
  const m = useRef<THREE.Mesh>(null);
  useFrame((_, d) => { if (m.current) m.current.rotation.y += d * 0.1; });
  return <mesh ref={m} position={pos}><sphereGeometry args={[size, 48, 48]} /><meshStandardMaterial color={color} roughness={1} /></mesh>;
}

interface Props { locations: Location[]; selected?: string | null; onSelect?: (id: string) => void; autoRotate?: boolean; showBodies?: boolean }

export default function Globe(p: Props) {
  return (
    <Canvas camera={{ position: [0, 0, 3.2], fov: 45 }} dpr={[1, 2]}
      onCreated={({ gl }) => gl.domElement.parentElement?.parentElement?.setAttribute("data-scene-ready", "1")}>
      <color attach="background" args={["#05070D"]} />
      <ambientLight intensity={0.35} />
      <directionalLight position={[5, 2, 4]} intensity={2.2} />
      <Stars radius={60} depth={40} count={3000} factor={3} fade speed={0.5} />
      {p.showBodies && <>
        <Body pos={[-3.6, 1.4, -4]} color="#bdbdbd" size={0.35} />
        <Body pos={[3.8, -1.2, -5]} color="#c1440e" size={0.45} />
      </>}
      <Suspense fallback={<mesh><sphereGeometry args={[1, 32, 32]} /><meshStandardMaterial color="#123" /></mesh>}>
        <Earth {...p} />
      </Suspense>
      <Atmosphere />
      <OrbitControls enablePan={false} minDistance={1.6} maxDistance={6} enableZoom={!p.showBodies} />
    </Canvas>
  );
}
