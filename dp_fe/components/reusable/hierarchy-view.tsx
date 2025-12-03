"use client";

import React, { useState } from "react";
import { cn } from "@/lib/utils";
import { ChevronDown, ChevronRight, MoreHorizontal, Plus, Trash2, Pencil, Eye } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface HierarchyNode {
  id: string;
  label: string;
  children?: HierarchyNode[];
  data?: any; // For custom data passing
}

interface HierarchyViewProps {
  data: HierarchyNode[];
  renderNode?: (node: HierarchyNode) => React.ReactNode;
  renderActions?: (node: HierarchyNode) => React.ReactNode;
  onNodeClick?: (node: HierarchyNode) => void;
  className?: string;
}

const TreeNode = ({
  node,
  renderNode,
  renderActions,
  onNodeClick,
  depth = 0,
  isLast = false,
  isRoot = false,
}: {
  node: HierarchyNode;
  renderNode?: (node: HierarchyNode) => React.ReactNode;
  renderActions?: (node: HierarchyNode) => React.ReactNode;
  onNodeClick?: (node: HierarchyNode) => void;
  depth?: number;
  isLast?: boolean;
  isRoot?: boolean;
}) => {
  const [isExpanded, setIsExpanded] = useState(true);
  const hasChildren = node.children && node.children.length > 0;

  return (
    <div className="relative">
      {/* Connecting Lines (only for non-root nodes) */}
      {!isRoot && (
        <>
          {/* Vertical Line Segment */}
          <div
            className={cn(
              "absolute -left-4 w-px bg-border",
              isLast ? "h-7 top-0" : "h-full top-0"
            )}
          />
          {/* Horizontal Line Connector */}
          <div className="absolute -left-4 top-7 w-4 h-px bg-border" />
        </>
      )}

      <div className="flex flex-col">
        <div className="flex flex-row items-center group py-2">
          {/* Node Content Container */}
          <div
            className={cn(
              "flex-1 flex items-center gap-2 bg-card border rounded-sm pr-2 shadow-sm transition-all hover:shadow-md relative overflow-hidden",
              onNodeClick && "cursor-pointer"
            )}
            onClick={() => onNodeClick?.(node)}
          >
            {/* Colored Indicator Bar */}
            <div 
              className={cn(
                "absolute left-0 top-0 bottom-0 w-1.5",
                node.data?.color || "bg-primary"
              )} 
            />

            {/* Expand/Collapse Toggle (inside the card now, or outside? Image shows lines going to card) */}
            {/* Let's put the toggle slightly outside or at the very left of the card content */}
            <div className="pl-3 pr-1">
              {hasChildren ? (
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 p-0 hover:bg-muted/50"
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsExpanded(!isExpanded);
                  }}
                >
                  {isExpanded ? (
                    <ChevronDown className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <ChevronRight className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              ) : (
                <div className="w-6" />
              )}
            </div>

            {/* Content */}
            <div className="flex-1 py-2">
              {renderNode ? (
                renderNode(node)
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded">
                    {node.id}
                  </span>
                  <span className="font-medium text-sm">{node.label}</span>
                </div>
              )}
            </div>

            {/* Actions */}
            <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity px-2">
              {renderActions ? (
                renderActions(node)
              ) : (
                <>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Eye className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-primary">
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="icon" className="h-7 w-7 text-muted-foreground hover:text-green-600">
                    <Plus className="h-4 w-4" />
                  </Button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Children Container */}
        {hasChildren && isExpanded && (
          <div className="flex flex-col ml-8 relative">
             {/* 
                We need a continuous vertical line for the children if this node is NOT the last child of its parent?
                No, the vertical line for children is drawn by the children themselves (relative to THIS node).
                Wait, if I am a parent, my children need a vertical line on their left connecting them.
                That line comes from ME (the parent) down to the last child.
                
                Actually, in the recursive structure:
                Child 1 draws a line from top to its center.
                Child 2 draws a line from top to its center.
                AND Child 1 draws a line from its center down to bottom (to connect to Child 2).
                
                My previous logic:
                `isLast ? "h-7 top-0" : "h-full top-0"`
                This handles the vertical line segment for the *current* node relative to its siblings.
                
                So for the *children* of the current node, they will be rendered in a container.
                The container needs to be indented.
             */}
            {node.children!.map((child, index) => (
              <TreeNode
                key={child.id}
                node={child}
                renderNode={renderNode}
                renderActions={renderActions}
                onNodeClick={onNodeClick}
                depth={depth + 1}
                isLast={index === node.children!.length - 1}
                isRoot={false}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export function HierarchyView({
  data,
  renderNode,
  renderActions,
  onNodeClick,
  className,
}: HierarchyViewProps) {
  return (
    <div className={cn("w-full overflow-auto p-6", className)}>
      <div className="flex flex-col">
        {data.map((rootNode, index) => (
          <TreeNode
            key={rootNode.id}
            node={rootNode}
            renderNode={renderNode}
            renderActions={renderActions}
            onNodeClick={onNodeClick}
            isLast={index === data.length - 1}
            isRoot={true}
          />
        ))}
      </div>
    </div>
  );
}
