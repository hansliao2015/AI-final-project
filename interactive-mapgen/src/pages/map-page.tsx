import { useEffect, useMemo, useRef, useState, type RefObject } from "react"
import { useParams } from "react-router"
import { useResizeObserver } from "usehooks-ts"
import { CheckLineIcon, DropletIcon, MountainIcon, WavesIcon } from "lucide-react"

import type { Mesh } from "@/lib/mapgen4/types"
import { makeMesh } from "@/lib/mapgen4/mesh"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Slider } from "@/components/ui/slider"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"

type Phase = "elevation" | "biomes" | "rivers" | "render"
type Param = Record<string, number | object> & Record<Phase, Record<string, number>>

const initialParams: Record<Phase, [string, number, number, number][]> = {
  elevation: [
    ["seed", 187, 1, 1 << 30],
    ["island", 0.5, 0, 1],
    ["noisy_coastlines", 0.01, 0, 0.1],
    ["hill_height", 0.02, 0, 0.1],
    ["mountain_jagged", 0, 0, 1],
    ["mountain_sharpness", 9.8, 9.1, 12.5],
    ["ocean_depth", 1.5, 1, 3]
  ],
  biomes: [
    ["wind_angle_deg", 0, 0, 360],
    ["raininess", 0.9, 0, 2],
    ["rain_shadow", 0.5, 0.1, 2],
    ["evaporation", 0.5, 0, 1]
  ],
  rivers: [
    ["lg_min_flow", 2.7, -5, 5],
    ["lg_river_width", -2.7, -5, 5],
    ["flow", 0.2, 0, 1]
  ],
  render: [
    ["zoom", 100 / 480, 100 / 1000, 100 / 50],
    ["x", 500, 0, 1000],
    ["y", 500, 0, 1000],
    ["light_angle_deg", 80, 0, 360],
    ["slope", 2, 0, 5],
    ["flat", 2.5, 0, 5],
    ["ambient", 0.25, 0, 1],
    ["overhead", 30, 0, 60],
    ["tilt_deg", 0, 0, 90],
    ["rotate_deg", 0, -180, 180],
    ["mountain_height", 50, 0, 250],
    ["outline_depth", 1, 0, 2],
    ["outline_strength", 15, 0, 30],
    ["outline_threshold", 0, 0, 100],
    ["outline_coast", 0, 0, 1],
    ["outline_water", 10.0, 0, 20], // things start going wrong when this is high
    ["biome_colors", 1, 0, 1]
  ]
}

export function MapPage() {
  const { mapId } = useParams()

  const containerRef = useRef<HTMLDivElement | null>(null)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const initializedRef = useRef<boolean>(false)
  const workingRef = useRef<boolean>(false)
  const workRequestedRef = useRef<boolean>(false)

  const [param, setParam] = useState<Param>({
    spacing: 5.5,
    mountainSpacing: 35,
    mesh: { seed: 12345 },
    ...Object.fromEntries((["elevation", "biomes", "rivers", "render"] as Phase[]).map(phase => {
      const phaseParams = initialParams[phase]
      return [phase, Object.fromEntries(phaseParams.map(([name, initialValue]) => {
        return [name, initialValue]
      }))]
    })) as Record<Phase, Record<string, number>>
  })
  const [render, setRender] = useState<import("@/lib/mapgen4/render").default | null>(null)
  const [Painting, setPainting] = useState<typeof import("@/lib/mapgen4/painting").default | null>(null)
  const [mesh, setMesh] = useState<Mesh | null>(null)
  const [tPeaks, setTPeaks] = useState<number[]>([])
  const [hasPainted, setHasPainted] = useState<boolean>(false)
  const [needUpdate, setNeedUpdate] = useState<boolean>(false)

  const { width = 0, height = 0 } = useResizeObserver({ ref: containerRef as RefObject<HTMLDivElement> })

  const size = useMemo<number>(() => Math.min(width, height), [width, height])
  const worker = useMemo<Worker>(() => new window.Worker("build/_worker.js"), [])

  const controllers = useMemo(() => {
    /* set initial parameters */
    const sections = (["elevation", "biomes", "rivers", "render"] as Phase[]).map(phase => {
      const sliders = initialParams[phase].map(([name, initialValue, min, max]) => {
        const step = name === "seed" ? 1 : 0.001
        return (
          <div key={name} className="flex flex-col gap-1">
            <span className="text-sm font-medium text-secondary-foreground">
              {name}
            </span>
            {name === "seed" ? (
              <Input id="seed" className="focus-visible:ring-0" type="number" value={param?.[phase][name] ?? initialValue} min={min} max={max} step={step} disabled={hasPainted} onChange={({ target: { value } }) => {
                let seed = initialValue
                try {
                  seed = parseInt(value)
                } catch (e) {
                  console.error("Invalid seed value", e)
                }
                setParam(param => param ? ({
                ...param,
                [phase]: {
                  ...param[phase],
                  [name]: isNaN(seed) ? initialValue : seed
                }
              }) : param)
              }} />
            ) : (
              <Slider value={[param?.[phase][name] ?? initialValue]} min={min} max={max} step={step} disabled={name === "island" ? hasPainted : false} onValueChange={value => {
                setParam(param => param ? ({
                  ...param,
                  [phase]: {
                    ...param[phase],
                    [name]: value[0]
                  }
                }) : param)
                if (phase === "render") {
                  render?.updateView({
                    ...param.render,
                    [name]: value[0]
                  })
                }
              }} />
            )}
          </div>
        )
      })

      return (
        <div key={phase} className="flex flex-col gap-2">
          <strong className="font-bold text-lg text-center text-secondary-foreground">{phase}</strong>
          {sliders}
        </div>
      )
    })

    return (
      <div className="flex flex-col gap-4">
        {sections}
      </div>
    )
  }, [param, render, hasPainted])

  useEffect(() => {
    if (!canvasRef.current) return

    function generate() {
      if (!render || !Painting) return
      if (!workingRef.current) {
        workingRef.current = true
        Painting.setElevationParam(param.elevation)
        setHasPainted(Painting.userHasPainted())
        worker.postMessage({
          param,
          constraints: {
            size: Painting.size,
            constraints: Painting.constraints,
          },
          quad_elements_buffer: render.quad_elements.buffer,
          a_quad_em_buffer: render.a_quad_em.buffer,
          a_river_xyuv_buffer: render.a_river_xyuv.buffer,
        }, [
          render.quad_elements.buffer,
          render.a_quad_em.buffer,
          render.a_river_xyuv.buffer,
        ])
      } else workRequestedRef.current = true
      if (needUpdate) setNeedUpdate(false)
    }

    async function initialize() {
      initializedRef.current = true

      const { mesh, t_peaks } = await makeMesh()
      setMesh(mesh)
      setTPeaks(t_peaks)

      const render = new (await import("@/lib/mapgen4/render").then(m => m.default))(mesh)
      const Painting = await import("@/lib/mapgen4/painting").then(m => m.default)

      setRender(render)
      setPainting(Painting)

      Painting.screenToWorldCoords = coords => {
        if (!render) return coords
        const out = render.screenToWorld(coords)
        return [out[0] / 1000, out[1] / 1000]
      }

      Painting.onUpdate = () => {
        setNeedUpdate(true)
        generate()
      }

      const elapsedTimeHistory: number[] = []

      worker.addEventListener("messageerror", event => {
        console.log("WORKER ERROR", event)
      })

      worker.addEventListener("message", event => {
        workingRef.current = false
        const { elapsed, numRiverTriangles, quad_elements_buffer, a_quad_em_buffer, a_river_xyuv_buffer } = event.data as {
          elapsed: number
          numRiverTriangles: number
          quad_elements_buffer: ArrayBuffer
          a_quad_em_buffer: ArrayBuffer
          a_river_xyuv_buffer: ArrayBuffer
        }
        elapsedTimeHistory.push(elapsed | 0)
        if (elapsedTimeHistory.length > 10) { elapsedTimeHistory.splice(0, 1) }
        // const timingDiv = document.getElementById("timing")
        // if (timingDiv) { timingDiv.innerText = `${elapsedTimeHistory.join(" ")} milliseconds` }
        render.quad_elements = new Int32Array(quad_elements_buffer)
        render.a_quad_em = new Float32Array(a_quad_em_buffer)
        render.a_river_xyuv = new Float32Array(a_river_xyuv_buffer)
        render.numRiverTriangles = numRiverTriangles
        render.updateMap()
        render.updateView(param.render)
        if (workRequestedRef.current) {
          requestAnimationFrame(() => {
            workRequestedRef.current = false
            generate()
          })
        }
      })

      worker.postMessage({ mesh, t_peaks, param })
      generate()
    }

    if (!initializedRef.current) initialize()
    else generate()
  }, [param, render, Painting, mesh, tPeaks, needUpdate, worker])

  return (
    <div className="flex flex-col flex-1 gap-4">
      <div className="flex flex-col items-center justify-center">
        <h1 className="font-bold text-4xl text-secondary-foreground">Map {mapId}</h1>
      </div>
      <div className="flex flex-1">
        <ScrollArea className="flex flex-col flex-1 p-4 max-w-60" style={{ height }}>
          <div className="flex justify-around gap-2">
            {["tiny", "small", "medium", "large"].map((size, index) => (
              <Button key={size} id={size} className="cursor-pointer" variant="ghost" size="icon">
                <svg viewBox="-50 -50 100 100"><circle r={(index + 1) * 10} /></svg>
              </Button>
            ))}
          </div>
          <div className="flex justify-around gap-2">
            <Button id="ocean" className="cursor-pointer" variant="ghost" size="icon">
              <WavesIcon size={16} />
            </Button>
            <Button id="shallow" className="cursor-pointer" variant="ghost" size="icon">
              <DropletIcon size={16} />
            </Button>
            <Button id="valley" className="cursor-pointer" variant="ghost" size="icon">
              <CheckLineIcon size={16} />
            </Button>
            <Button id="mountain" className="cursor-pointer" variant="ghost" size="icon">
              <MountainIcon size={16} />
            </Button>
          </div>
          <Separator className="my-4" />
          {controllers}
          <Separator className="my-4" />
          <div className="flex justify-around">
            <Button id="button-reset" className="cursor-pointer" variant="destructive" disabled={!hasPainted}>Reset</Button>
          </div>
        </ScrollArea>
        <div ref={containerRef} id="map" className="flex flex-1 items-center">
          <canvas ref={canvasRef} id="mapgen4" style={{ width: size, height: size }} />
        </div>
      </div>
    </div>
  )
}
