import { MouseEvent, useEffect, useId, useRef, useState } from 'react'

import {
  DndContext,
  DragEndEvent,
  DragOverlay,
  DragStartEvent,
  KeyboardSensor,
  PointerSensor,
  useDroppable,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  restrictToVerticalAxis,
  restrictToWindowEdges,
} from '@dnd-kit/modifiers'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import GeneticElement from '@eplant/GeneticElement'
import {
  useActiveGeneId,
  useCollections,
  useGeneticElements,
} from '@eplant/state'
import { Add, Check, ExpandMore } from '@mui/icons-material'
import {
  Box,
  Button,
  Card,
  Collapse,
  IconButton,
  Menu,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from '@mui/material'

import GeneticElementComponent, {
  GeneticElementComponentProps,
} from '../GeneticElementComponent'
import OptionsButton from '../OptionsButton'

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
      direction='column'
      spacing={1}
      style={{
        justifyContent: 'center',
      }}
    >
      <Card
        elevation={0}
        sx={(theme) => ({
          borderRadius: theme.shape.borderRadius + 'px',
          color: theme.palette.text.secondary,
          backgroundColor:
            genes.length > 0 && !open
              ? theme.palette.background.paper
              : theme.palette.background.default,
        })}
      >
        <Stack
          onClick={() => setOpen(!open)}
          onMouseOver={() => setHover(true)}
          onMouseLeave={() => setHover(false)}
          direction='row'
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
              ':hover': {
                color: theme.palette.text.primary,
              },
            })}
          />
          <TextField
            style={{
              display: renaming ? undefined : 'none',
              maxHeight: '100%',
            }}
            size='small'
            inputRef={inputRef}
            onKeyPress={(e) => {
              if (e.key == 'Enter') rename()
            }}
            onBlur={() => rename()}
          ></TextField>
          <Typography
            style={{
              display: !renaming ? undefined : 'none',
              width: '100%',
            }}
          >
            <span
              style={{
                display: 'flex',
                flexFlow: 'column',
                lineHeight: 'normal',
                padding: '8px 0px',
                // justifyContent: 'space-between',
              }}
            >
              <span>{name}</span>
              <span style={{ fontSize: '0.8rem', opacity: '0.5' }}>
                {genes.length > 0 && !open ? genes.length + ' genes' : ''}
              </span>
            </span>
          </Typography>
          <div style={{ flex: 1 }} />
          {renaming ? (
            <IconButton color='primary' onClick={rename}>
              <Check></Check>
            </IconButton>
          ) : (
            <OptionsButton
              onClick={(e) => (openMenu(e), e.stopPropagation())}
              sx={(theme) => ({
                width: '24px',
                height: '24px',
                opacity: hover ? '1' : '0',
                color: theme.palette.text.secondary,
                ':hover': {
                  background: theme.palette.background.hover,
                  color: theme.palette.text.primary,
                },
              })}
            ></OptionsButton>
          )}
        </Stack>
      </Card>
      <Collapse in={open} sx={{ marginTop: '0px !important' }}>
        <SortableContext items={genes} strategy={verticalListSortingStrategy}>
          <Stack
            direction='column'
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
              <Stack spacing={1} direction='row'>
                <Typography
                  variant='caption'
                  fontStyle='italic'
                  sx={(theme) => ({
                    color: theme.palette.background.hover,
                    padding: '0.25rem 0.75rem',
                    flexGrow: 1,
                    border: 'dashed 1px',
                    borderColor: theme.palette.background.hover,
                    borderRadius: theme.shape.borderRadius + 'px',
                  })}
                >
                  Drag genes to reorder them
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

  function openMenu(e: MouseEvent<HTMLElement>) {
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
  const [collections, setCollections] = useCollections()

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 10,
      },
    }),
    useSensor(KeyboardSensor, {})
  )

  const [activeId, setActiveId] = useState<string | undefined>(undefined)

  // If there are genes that aren't in a collection, put them in the first
  useEffect(() => {
    setCollections((collections) => {
      const unincluded = genes.map(
        (g) =>
          !collections.some((c) => c.genes.some((geneId) => geneId == g.id))
      )
      if (unincluded.some((x) => x)) {
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
          genes: (cols[0]?.genes ?? []).concat(
            genes.filter((g, i) => unincluded[i]).map((g) => g.id)
          ),
        }
        return cols
      } else return collections
    })
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
      <Stack direction='column' spacing={2}>
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
                  ...p,
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
                  ...p,
                  open: !p.open,
                }
                return cols
              })
            }}
            activeId={activeId}
          />
        ))}
        <Button
          startIcon={<Add />}
          variant='text'
          color='secondary'
          size='small'
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
      const activeArrayCollection = cols[activeArrayIndex]
      if (!activeArrayCollection) return collections
      const activeArray = activeArrayCollection.genes.slice()
      const activeIndex = activeArray.indexOf(activeGene.id)

      // Handle the case where the active gene is dropped directly on to a collection, rather than on top of another gene
      if (over.id.toString().startsWith('Collection-')) {
        const bottom = over.id.toString().includes('bottom')
        const idx = parseInt(
          over.id
            .toString()
            .replace('Collection-' + (bottom ? 'bottom' : 'top'), '')
        )
        if (idx == activeArrayIndex) return collections

        const overCollection = cols[idx]
        if (!overCollection) return collections
        const overArray = overCollection.genes.slice()

        activeArray.splice(activeIndex, 1)
        cols[activeArrayIndex] = {
          name: activeArrayCollection.name,
          genes: activeArray,
          open: activeArrayCollection.open || finished,
        }

        if (bottom) overArray.push(activeGene.id)
        else overArray.unshift(activeGene.id)
        cols[idx] = {
          name: overCollection.name,
          genes: overArray,
          open: overCollection.open || finished,
        }
        return cols
      } else if (swapWithinCollection) return collections

      const overGene = genes.find((g) => g.id == over.id)
      // TODO: Handle this error?
      if (!overGene) return collections

      const overArrayIndex = cols.findIndex((col) =>
        col.genes.includes(overGene.id)
      )
      const overArrayCollection = cols[overArrayIndex]
      if (!overArrayCollection) return collections
      const overArray = overArrayCollection.genes.slice()

      const overIndex = overArray.indexOf(overGene.id)

      activeArray.splice(activeIndex, 1)
      // If the active gene is in the same collection as the over gene then move them
      if (activeArrayIndex == overArrayIndex) {
        activeArray.splice(overIndex, 0, activeGene.id)
        // Move activeGene to overGene's position
        cols[activeArrayIndex] = {
          name: activeArrayCollection.name,
          genes: activeArray,
          open: activeArrayCollection.open || finished,
        }
      } else {
        overArray.splice(overIndex, 0, activeGene.id)
        cols[activeArrayIndex] = {
          name: activeArrayCollection.name,
          genes: activeArray,
          open: activeArrayCollection.open || finished,
        }
        cols[overArrayIndex] = {
          name: overArrayCollection.name,
          genes: overArray,
          open: overArrayCollection.open || finished,
        }
      }
      return cols
    })
  }

  function deleteGene(gene: GeneticElement) {
    setCollections((collections) => {
      const cols = collections.slice()
      const idx = cols.findIndex((c) => c.genes.includes(gene.id))
      const collection = cols[idx]
      if (!collection) return collections
      cols[idx] = {
        ...collection,
        genes: collection.genes.filter((g) => g != gene.id),
      }
      return cols
    })
    setGenes(genes.filter((g) => g != gene))
  }

  function deleteCollection(index: number) {
    setGenes(genes.filter((g) => !collections[index]?.genes.includes(g.id)))
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
