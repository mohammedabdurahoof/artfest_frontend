"use client"

import { ChevronRight } from "lucide-react"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
} from "@/components/ui/sidebar"
import Link from "next/link"
import { useAuth } from "@/components/auth-provider" // Import useAuth
import type { ProjectItem } from "@/types/auth" // Import ProjectItem type

export function NavProjects({
  projects,
}: {
  projects: ProjectItem[] // Use the new ProjectItem type
}) {
  const { hasPermission } = useAuth() // Get hasPermission from context

  // Filter top-level projects based on permissions
  const filteredProjects = projects.filter((project) =>
    project.requiredPermission ? hasPermission(project.requiredPermission) : true,
  )

  return (
    <SidebarGroup>
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {filteredProjects.map((project) => (
          <Collapsible key={project.name} asChild className="group/collapsible">
            <SidebarMenuItem>
              <CollapsibleTrigger asChild>
                <SidebarMenuButton tooltip={project.name}>
                  {project.icon && <project.icon />}
                  <Link href={project.url}>{project.name}</Link>
                  {project.items && (
                    <ChevronRight className="ml-auto transition-transform duration-200 group-data-[state=open]/collapsible:rotate-90" />
                  )}
                </SidebarMenuButton>
              </CollapsibleTrigger>
              {project.items && (
                <CollapsibleContent>
                  <SidebarMenuSub>
                    {project.items
                      .filter((subItem) =>
                        subItem.requiredPermission ? hasPermission(subItem.requiredPermission) : true,
                      ) // Filter sub-items
                      .map((subItem) => (
                        <SidebarMenuSubItem key={subItem.title}>
                          <SidebarMenuSubButton asChild>
                            <Link href={subItem.url}>
                              <span>{subItem.title}</span>
                            </Link>
                          </SidebarMenuSubButton>
                        </SidebarMenuSubItem>
                      ))}
                  </SidebarMenuSub>
                </CollapsibleContent>
              )}
            </SidebarMenuItem>
          </Collapsible>
        ))}
      </SidebarMenu>
    </SidebarGroup>
  )
}
