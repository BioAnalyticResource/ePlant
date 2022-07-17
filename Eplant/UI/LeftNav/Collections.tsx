import { useGeneticElements } from '@eplant/state'
import GeneticElement from '@eplant/GeneticElement'
import {
  Add,
  Check,
  ExpandMore,
  MoreVert,
  SignalCellularNoSimOutlined,
} from '@mui/icons-material'
import {
  Button,
  Card,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material'
import { Box } from '@mui/material'
import React, { useId, useState, useRef, useEffect } from 'react'
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
  useSensors,
  KeyboardSensor,
  PointerSensor,
  useSensor,
} from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import _, { truncate } from 'lodash'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import OptionsButton from '../OptionsButton'
import useStateWithStorage from '@eplant/util/useStateWithStorage'

/**
 * A draggable/sortable version of {@link GeneticElementComponent}
 * @param {(GeneticElementComponentProps & { active: boolean })} props
 * @param {boolean} props.active Set to active if this component is currently being dragged
 */
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

type CollectionProps = {
  genes: GeneticElement[]
  name: string
  id?: number
  activeId?: string
  open: boolean
  setOpen: (open: boolean) => void
  onNameChange: (newName: string) => void
  deleteGene: (gene: GeneticElement) => void
  onRemove: () => void
  selectedGene?: string
  onSelectGene?: (gene: GeneticElement) => void
}
/**
 * A sortable, renamable collection of {@link GeneticElementComponent}s
 *
 * @export
 * @param {CollectionProps} props
 * @param {GeneticElement[]} props.genes The genetic elements in this collection
 * @param {string} props.name The current name of this collection
 * @param {number} props.id The id of this collection. Necessary if multiple collections are being used {@link Collections}
 * @param {string} props.activeId The id of the {@link GeneticElement} that is being dragged
 * @param {boolean} props.open When set to false the collection is rendered as collapsed
 * @param {CollectionProps['setOpen']} props.setOpen Called when a user clicks the collection
 * @param {CollectionProps['onNameChange']} props.onNameChange Called when a user renames the collection
 * @param {CollectionProps['deleteGene']} props.deleteGene Called when a user deletes a gene
 * @param {CollectionProps['onRemove']} props.onRemove Called when this collection is deleted
 */
export function Collection({
  genes,
  name,
  id,
  activeId,
  open,
  setOpen,
  deleteGene,
  onRemove,
  onNameChange,
  selectedGene,
  onSelectGene,
}: CollectionProps) {
  const [hover, setHover] = useState<boolean>(false)

  const { setNodeRef: setTopRef } = useDroppable({
    id: 'Collection-top' + id ?? '',
  })
  const { setNodeRef: setBottomRef } = useDroppable({
    id: 'Collection-bottom' + id ?? '',
  })

  const menuId = useId()
  const [menuOpen, setMenuOpen] = useState(false)
  const [menuEl, setMenuEl] = useState<HTMLElement>()

  const [deleting, setDeleting] = useState(false)
  const [renaming, setRenaming] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  return (
    <Stack
      direction="column"
      spacing={1}
      data-testid="collection"
      style={{
        justifyContent: 'center',
      }}
    >
      <Card
        elevation={0}
        sx={(theme) => ({
          borderRadius: theme.shape.borderRadius,
          color: theme.palette.text.secondary,
          ':hover': {
            backgroundColor: theme.palette.background.active,
          },
        })}
      >
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
            alignItems: 'center',
          })}
        >
          <ExpandMore
            sx={(theme) => ({
              transform: `rotate(${open ? 0 : -90}deg)`,
              transition: 'all 0.5s ease',
            })}
          />
          <TextField
            style={{
              display: renaming ? undefined : 'none',
              maxHeight: '100%',
            }}
            size="small"
            inputRef={inputRef}
            onSubmit={(e) => console.log(e)}
            onKeyPress={(e) => {
              if (e.key == 'Enter') rename()
            }}
            onBlur={() => rename()}
          ></TextField>
          <Typography
            style={{
              display: !renaming ? undefined : 'none',
            }}
          >
            {name}
          </Typography>
          <div style={{ flex: 1 }} />
          {renaming ? (
            <IconButton color="primary" onClick={rename}>
              <Check></Check>
            </IconButton>
          ) : (
            <OptionsButton
              onClick={(e) => (openMenu(e), e.stopPropagation())}
              sx={(theme) => ({
                width: '24px',
                height: '24px',
                color: theme.palette.text.secondary,
              })}
            ></OptionsButton>
          )}
        </Stack>
      </Card>
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
                  selected={g.id == selectedGene}
                  onRemove={() => deleteGene(g)}
                  onClick={() => onSelectGene?.(g)}
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
      <Menu
        id={menuId}
        anchorEl={menuEl}
        open={menuOpen}
        onClose={closeMenu}
        MenuListProps={{
          dense: true,
          'aria-labelledby': 'basic-button',
        }}
      >
        <MenuItem
          onClick={() => {
            setRenaming(true)
            if (inputRef.current) {
              inputRef.current.value = name
              setTimeout(() => {
                inputRef.current?.focus()
                inputRef.current?.select()
              }, 50)
            }
            closeMenu()
          }}
        >
          Rename collection
        </MenuItem>
        <MenuItem
          sx={(theme) => ({
            ':hover': {
              background: theme.palette.error.main,
            },
          })}
          onClick={remove}
        >
          {deleting ? 'Are you sure?' : 'Remove collection'}
        </MenuItem>
      </Menu>
    </Stack>
  )

  function openMenu(e: React.MouseEvent<HTMLElement>) {
    setMenuEl(e.currentTarget)
    setMenuOpen(true)
  }
  function closeMenu() {
    setMenuEl(undefined)
    setMenuOpen(false)
    setDeleting(false)
  }

  function rename() {
    setRenaming(false)
    if (inputRef.current) onNameChange(inputRef.current.value)
  }
  function remove() {
    if (!deleting) setDeleting(true)
    else {
      onRemove()
      closeMenu()
    }
  }
}
/**
 * A list of {@link Collection}s that genes can be dragged between.
 * @param props.onSelectGene A method called when a gene is selected
 * @param props.selectedGene The id of the gene that is currently selected
 * @returns
 */
export function Collections(props: {
  onSelectGene?: (gene: GeneticElement) => void
  selectedGene?: string
}) {
  const [genes, setGenes] = useGeneticElements()
  const [collections, setCollections] = useStateWithStorage<
    { genes: string[]; name: string; open: boolean }[]
  >('collections', [
    {
      genes: genes.map((g) => g.id),
      name: 'Collection 1',
      open: true,
    },
  ])

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {})
  )

  const [activeId, setActiveId] = React.useState<string | undefined>(undefined)

  // If there are genes that aren't in a collection, put them in the first
  useEffect(() => {
    const unincluded = genes.map(
      (g) => !collections.some((c) => c.genes.some((geneId) => geneId == g.id))
    )

    if (unincluded.some((x) => x)) {
      setCollections((collections) => {
        const cols = collections.slice()
        if (cols.length == 0) {
          cols.push({
            genes: [],
            name: 'Collection 1',
            open: true,
          })
        }
        cols[0] = {
          ...cols[0],
          genes: cols[0].genes.concat(
            genes.filter((g, i) => unincluded[i]).map((g) => g.id)
          ),
        }
        return cols
      })
    }
  }, [genes, collections])

  return (
    <DndContext
      sensors={sensors}
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
        {collections.map((p, i) => (
          <Collection
            key={i}
            selectedGene={props.selectedGene}
            onSelectGene={props.onSelectGene}
            id={i}
            genes={
              p.genes
                .map((id) => genes.find((g) => g.id == id))
                .filter((g) => g) as GeneticElement[]
            }
            name={p.name}
            open={p.open}
            onRemove={() => {
              deleteCollection(i)
            }}
            onNameChange={(newName) => {
              setCollections((collections) => {
                const cols = collections.slice()
                cols[i] = {
                  ...cols[i],
                  name: newName,
                }
                return cols
              })
            }}
            deleteGene={(g) => deleteGene(g)}
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
        <Button
          startIcon={<Add />}
          variant="text"
          color="secondary"
          size="small"
          sx={(theme) => ({
            alignSelf: 'start',
          })}
          onClick={addCollection}
        >
          Add collection
        </Button>
      </Stack>
      <DragOverlay modifiers={[restrictToWindowEdges]}>
        {activeId ? (
          <GeneticElementComponent
            hovered={true}
            selected={activeId == props.selectedGene}
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
        col.genes.includes(activeGene.id)
      )
      const activeArray = cols[activeArrayIndex].genes.slice()
      const activeIndex = activeArray.indexOf(activeGene.id)

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
        if (bottom) cols[idx].genes.push(activeGene.id)
        else cols[idx].genes.unshift(activeGene.id)
        return cols
      } else if (swapWithinCollection) return collections

      const overGene = genes.find((g) => g.id == over.id)
      // TODO: Handle this error?
      if (!overGene) return collections

      const overArrayIndex = cols.findIndex((col) =>
        col.genes.includes(overGene.id)
      )
      const overArray = cols[overArrayIndex].genes.slice()

      const overIndex = overArray.indexOf(overGene.id)

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
        overArray.splice(overIndex, 0, activeGene.id)
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

  function deleteGene(gene: GeneticElement) {
    setCollections((collections) => {
      const cols = collections.slice()
      const idx = cols.findIndex((c) => c.genes.includes(gene.id))
      cols[idx] = {
        ...cols[idx],
        genes: cols[idx].genes.filter((g) => g != gene.id),
      }
      return cols
    })
    setGenes(genes.filter((g) => g != gene))
  }

  function deleteCollection(index: number) {
    setGenes(genes.filter((g) => !collections[index].genes.includes(g.id)))
    setCollections(collections.filter((c, i) => i != index))
  }

  function addCollection() {
    setCollections(
      collections.concat([
        {
          genes: [],
          name: 'Collection ' + (collections.length + 1),
          open: true,
        },
      ])
    )
  }
}
