import { useGeneticElements } from '@eplant/contexts/geneticElements'
import GeneticElement from '@eplant/GeneticElement'
import { ExpandMore, MoreVert } from '@mui/icons-material'
import {
  Card,
  Collapse,
  IconButton,
  Paper,
  Stack,
  Typography,
} from '@mui/material'
import { Box } from '@mui/system'
import React from 'react'
import GeneticElementComponent, {
  GeneticElementComponentProps,
} from '../GeneticElementComponent'
import {
  SortableContext,
  arrayMove,
  verticalListSortingStrategy,
  useSortable,
} from '@dnd-kit/sortable'
import {
  DndContext,
  DragEndEvent,
  useDroppable,
  DragOverEvent,
  DragStartEvent,
  DragOverlay,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import _, { truncate } from 'lodash'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'

function SortableGeneticElement(
  props: GeneticElementComponentProps & { active: boolean }
) {
  const { attributes, listeners, setNodeRef, transform, transition } =
    useSortable({
      id: props.geneticElement.id,
      transition: {
        duration: 0,
        easing: 'linear',
      },
    })
  return (
    <Box
      {...attributes}
      {...listeners}
      ref={setNodeRef}
      sx={{
        transform: CSS.Transform.toString(transform),
        transition,
      }}
    >
      {props.active ? (
        <Box
          sx={(theme) => ({
            width: '100%',
            height: '24px',
            border: `1px dashed ${theme.palette.primary.main}`,
            borderRadius: theme.shape.borderRadius,
          })}
        />
      ) : (
        <GeneticElementComponent {...props} />
      )}
    </Box>
  )
}

export function Collection({
  genes,
  name,
  id,
  activeId,
  open,
  setOpen,
}: {
  genes: GeneticElement[]
  name: string
  id?: number
  activeId?: string
  open: boolean
  setOpen: (open: boolean) => void
}) {
  const [hover, setHover] = React.useState<boolean>(false)

  const { setNodeRef: setTopRef } = useDroppable({
    id: 'Collection-top' + id ?? '',
  })
  const { setNodeRef: setBottomRef } = useDroppable({
    id: 'Collection-bottom' + id ?? '',
  })
  return (
    <Stack direction="column" spacing={1}>
      <Stack
        onClick={() => setOpen(!open)}
        onMouseOver={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
        direction="row"
        gap={1}
        ref={setTopRef}
        sx={(theme) => ({
          userSelect: 'none',
          cursor: 'pointer',
          background: hover ? theme.palette.secondary.main : 'transparent',
          borderRadius: theme.shape.borderRadius,
          color: theme.palette.text.secondary,
        })}
      >
        <ExpandMore
          sx={(theme) => ({
            transform: `rotate(${open ? 0 : -90}deg)`,
            transition: 'all 0.5s ease',
          })}
        />
        <Typography>{name}</Typography>
        <div style={{ flex: 1 }} />
        <MoreVert onClick={(e) => e.stopPropagation()} />
      </Stack>
      <Collapse in={open}>
        <SortableContext items={genes} strategy={verticalListSortingStrategy}>
          <Stack
            direction="column"
            spacing={1}
            paddingBottom={2}
            ref={setBottomRef}
          >
            {genes.length ? (
              genes.map((g, i) => (
                <SortableGeneticElement
                  active={g.id == activeId}
                  key={g.id}
                  geneticElement={g}
                  // TODO: select the gene that is in the currently focused view
                  selected={g.id == 'AT1G01010'}
                  // TODO: Make the menu popup that allows you to remove genes
                  onClickMenu={() => {}}
                ></SortableGeneticElement>
              ))
            ) : (
              <Stack spacing={1} direction="row">
                <div style={{ width: '24px' }} />
                <Typography
                  variant="caption"
                  fontStyle="italic"
                  sx={(theme) => ({
                    color: theme.palette.text.disabled,
                  })}
                >
                  Drag genes here
                </Typography>
              </Stack>
            )}
          </Stack>
        </SortableContext>
      </Collapse>
    </Stack>
  )
}
export function Collections() {
  const [genes, setGenes] = useGeneticElements()
  const [collections, setCollections] = React.useState<
    { genes: GeneticElement[]; name: string; open: boolean }[]
  >([
    {
      genes: genes,
      name: 'Collection 1',
      open: true,
    },
    {
      genes: [],
      name: 'Collection 2',
      open: true,
    },
  ])

  const [activeId, setActiveId] = React.useState<string | undefined>(undefined)

  return (
    <DndContext
      modifiers={[restrictToVerticalAxis]}
      onDragStart={handleDragStart}
      onDragOver={(ev) =>
        handleDrag(ev, { finished: false, swapWithinCollection: false })
      }
      onDragEnd={(ev) =>
        handleDrag(ev, { finished: true, swapWithinCollection: true })
      }
    >
      <Stack direction="column" spacing={2}>
        {collections.map((props, i) => (
          <Collection
            key={i}
            id={i}
            {...props}
            setOpen={() => {
              setCollections((collections) => {
                const cols = collections.slice()
                cols[i] = {
                  open: !cols[i].open,
                  genes: cols[i].genes,
                  name: cols[i].name,
                }
                return cols
              })
            }}
            activeId={activeId}
          />
        ))}
      </Stack>
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeId ? (
          <GeneticElementComponent
            hovered={true}
            // TODO: Make this follow the selected gene
            selected={false}
            geneticElement={
              genes.find((g) => g.id == activeId) as GeneticElement
            }
            animateText={false}
          />
        ) : undefined}
      </DragOverlay>
    </DndContext>
  )

  function handleDragStart(event: DragStartEvent) {
    setActiveId(event.active.id.toString())
  }

  function handleDrag(
    event: DragEndEvent,
    {
      // Set to true on drag end
      finished,
      // Updates state on drags within a collection
      // If it's set to false then state only updates
      // when elements are dragged between collections

      swapWithinCollection,
    }: { finished: boolean; swapWithinCollection: boolean }
  ) {
    if (finished) setActiveId(undefined)
    const { active, over } = event
    // Put active gene in place of the gene that it is currently over
    if (!over) return // Not dropped on a droppable

    // If they are in the same array we can move them
    // If not then splice the activeGene into the other array
    setCollections((collections) => {
      const cols = collections.slice()
      const activeGene = genes.find((g) => g.id == active.id)
      if (!activeGene) return collections
      const activeArrayIndex = cols.findIndex((col) =>
        col.genes.includes(activeGene)
      )
      const activeArray = cols[activeArrayIndex].genes.slice()
      const activeIndex = activeArray.indexOf(activeGene)

      if (over.id.toString().startsWith('Collection-')) {
        const bottom = over.id.toString().includes('bottom')
        const idx = parseInt(
          over.id
            .toString()
            .replace('Collection-' + (bottom ? 'bottom' : 'top'), '')
        )

        activeArray.splice(activeIndex, 1)
        cols[activeArrayIndex] = {
          name: cols[activeArrayIndex].name,
          genes: activeArray,
          open: cols[activeArrayIndex].open || finished,
        }
        cols[idx] = {
          name: cols[idx].name,
          genes: cols[idx].genes,
          open: cols[idx].open || finished,
        }
        if (bottom) cols[idx].genes.push(activeGene)
        else cols[idx].genes.unshift(activeGene)
        return cols
      } else if (swapWithinCollection) return collections

      const overGene = genes.find((g) => g.id == over.id)
      // TODO: Handle this error?
      if (!overGene) return collections

      const overArrayIndex = cols.findIndex((col) =>
        col.genes.includes(overGene)
      )
      const overArray = cols[overArrayIndex].genes.slice()

      const overIndex = overArray.indexOf(overGene)

      if (activeArrayIndex == overArrayIndex) {
        const g = activeArray[activeIndex]
        activeArray.splice(activeIndex, 1)
        activeArray.splice(overIndex, 0, g)
        // Move activeGene to overGene's position
        cols[activeArrayIndex] = {
          name: cols[activeArrayIndex].name,
          genes: activeArray,
          open: cols[activeArrayIndex].open || finished,
        }
      } else {
        activeArray.splice(activeIndex, 1)
        overArray.splice(overIndex, 0, activeGene)
        cols[activeArrayIndex] = {
          name: cols[activeArrayIndex].name,
          genes: activeArray,
          open: cols[activeArrayIndex].open || finished,
        }
        cols[overArrayIndex] = {
          name: cols[overArrayIndex].name,
          genes: overArray,
          open: cols[overArrayIndex].open || finished,
        }
      }
      return cols
    })
  }
}
