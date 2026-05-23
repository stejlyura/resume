import React from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface SortableExperienceItemProps {
  id: string;
  children: (props: {
    ref: (node: HTMLElement | null) => void;
    style: React.CSSProperties;
    dragHandleProps: any;
    isDragging: boolean;
  }) => React.ReactNode;
}

export function SortableExperienceItem({ id, children }: SortableExperienceItemProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style: React.CSSProperties = {
    transform: CSS.Transform.toString(transform),
    transition,
    position: 'relative',
    zIndex: isDragging ? 50 : undefined,
    opacity: isDragging ? 0.5 : undefined,
  };

  const dragHandleProps = {
    ...attributes,
    ...listeners,
    style: { cursor: isDragging ? 'grabbing' : 'grab' },
  };

  return <>{children({ ref: setNodeRef, style, dragHandleProps, isDragging })}</>;
}
