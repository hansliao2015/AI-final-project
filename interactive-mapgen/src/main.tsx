import { StrictMode } from "react"
import { createRoot } from "react-dom/client"
import { BrowserRouter, Route, Routes } from "react-router"

import { Layout } from "./layout"
import { HomePage } from "./pages/home-page"
import { MapPage } from "./pages/map-page"

import "./index.css"

createRoot(document.getElementById("root") as HTMLElement).render(
  <StrictMode>
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Layout />}>
          <Route index element={<HomePage />} />
          <Route path="home" element={<HomePage />} />
          <Route path="maps">
            <Route path=":mapId" element={<MapPage />} />
          </Route>
        </Route>
      </Routes>
    </BrowserRouter>
  </StrictMode>
)
