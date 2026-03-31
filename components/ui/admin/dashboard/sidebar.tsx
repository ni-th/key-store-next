import NavLinks from "./sidebar-links"

const Sidebar = () => {
  return (
    <aside className="h-full w-full border-r bg-background">
      <div className="flex h-full flex-col gap-2 p-3">
        <NavLinks />
      </div>
    </aside>
  )
}

export default Sidebar