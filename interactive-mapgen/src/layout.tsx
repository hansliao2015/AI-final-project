import { Outlet } from "react-router"

export function Layout() {
  return (
    <div className="flex flex-col w-full h-full">
      <Outlet />
    </div>
  )
}
