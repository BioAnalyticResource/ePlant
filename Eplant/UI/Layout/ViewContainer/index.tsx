import { useEffect, useId, useMemo, useState } from 'react'
import { Outlet, useLocation, useNavigate, useParams } from 'react-router-dom'

import { useConfig } from '@eplant/config'
import GeneticElement from '@eplant/GeneticElement'
import {
  useActiveGeneId,
  useActiveViewId,
  useGeneticElements,
  usePrinting,
  useSpecies,
} from '@eplant/state'
import { URLStateProvider } from '@eplant/state/URLStateManager'
import Modal from '@eplant/UI/Modal'
import downloadFile from '@eplant/util/downloadFile'
import ErrorBoundary from '@eplant/util/ErrorBoundary'
import { useViewData } from '@eplant/View/viewData'
import CellEFP from '@eplant/views/CellEFP'
import FallbackView from '@eplant/views/FallbackView'
import {
  AppBar,
  Box,
  BoxProps,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  ListItemText,
  MenuItem,
  Select,
  Stack,
  Toolbar,
  Typography,
} from '@mui/material'

import { View } from '../../../View'

import LoadingPage from './LoadingPage'
import { ViewContext } from './types'
import ViewOptions from './ViewOptions'

/**
 * Wraps a view in a container that provides a toolbar and a download button. It also manages loading the view's data.
 * @param props.view The view to wrap
 * @param props.setView A function that is called when the user requests to change the wrapped view
 * @param props.gene The gene that is currently selected
 * @param props The remaining props are passed directly to the container
 * @returns
 */
export function ViewContainer<T, S, A>({
  gene,
  ...props
}: {
  gene: GeneticElement | null
} & BoxProps) {
  // const { activeData, error, dispatch, state } = useViewData(view, gene)
  const [loading, setLoading] = useState(false)
  const [loadAmount, setLoadAmount] = useState(0)
  const idLabel = useId()
  const selectId = useId()
  const [printing, setPrinting] = usePrinting()

  const [viewingCitations, setViewingCitations] = useState(false)

  const { userViews, views, genericViews } = useConfig()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [speciesList] = useSpecies()
  const [genes, setGenes] = useGeneticElements()
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [activeViewId, setActiveViewId] = useActiveViewId()
  const activeView = views.find((view) => view.id === activeViewId) ?? CellEFP

  useEffect(() => {
    if (printing) {
      setTimeout(() => {
        window.print()
        setPrinting(false)
      }, 100)
    }
  }, [printing])

  // On app url change, make sure loaded gene and view aligns with URL
  useEffect(() => {
    const loadGene = async (geneid: string) => {
      // TODO: This is super jank, should probably write some better utilities for loading genes
      const species = speciesList.find(
        (species) => species.name === 'Arabidopsis'
      )
      const gene = await species?.api.searchGene(geneid)
      if (gene) {
        setGenes([...genes, gene])
      }
    }
    if (params.geneid) {
      if (params.geneid !== activeGeneId) {
        if (!genes.find((gene) => gene.id === params.geneid)) {
          loadGene(params.geneid)
        }
        setActiveGeneId(params.geneid)
      }
    } else {
      // Set active gene to first available if one is already loaded
      if (genes.length > 0) {
        setActiveGeneId(genes[0].id)
      } else {
        setActiveGeneId('')
      }
    }

    const urlView =
      views.find((view) => view.id === location.pathname.split('/')[1]) ??
      CellEFP
    setActiveViewId(urlView.id)
  }, [])

  // On active gene change update the gene path segment
  useEffect(() => {
    if (location.pathname !== import.meta.env.BASE_URL) {
      // Only run this after initial redirect
      const pathSegments = location.pathname
        .split('/')
        .filter((segment) => segment !== '')
      if (pathSegments.length == 2 && activeGeneId) {
        pathSegments[pathSegments.length - 1] = activeGeneId
      } else if (pathSegments.length == 1 && activeGeneId) {
        pathSegments.push(activeGeneId)
        // Will never get here as of now, but if we decide to persist activeGene need
        // to do this.
      }

      const newPath = '/' + pathSegments.join('/') + '/' + location.search
      if (newPath !== location.pathname + '/' + location.search) {
        navigate(newPath)
      }
    }
  }, [activeGeneId])

  // TODO: This currently re-renders even on just a gene change because location is in
  // dependency array. Location **has** to be a dependency in this case or else it goes stale
  // (see how useMemo deals with dependencies). Might want to break this out
  // into a seperate component as well.
  const topBar = useMemo(() => {
    return (
      <AppBar
        variant='elevation'
        sx={(theme) => ({
          background: theme.palette.background.active,
        })}
        position='sticky'
        elevation={0}
      >
        <Toolbar
          sx={(theme) => ({
            gap: '8px',
            paddingRight: 16,
            borderStyle: 'solid',
            borderWidth: '1px 0px 1px 1px',
            borderColor: theme.palette.background.edge,
            borderLeftColor: theme.palette.background.edgeLight,
          })}
        >
          <Stack
            direction='row'
            gap={2}
            sx={{
              flexGrow: 1,
              height: '100%',
              alignItems: 'center',
            }}
          >
            {/* View selector dropdown */}
            <FormControl variant='standard'>
              <Select
                value={activeView.id}
                renderValue={() => {
                  if (activeView.id == 'get-started') {
                    return <span style={{ paddingLeft: 8 }}>View selector</span>
                  }
                  return (
                    <span
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                      }}
                    >
                      <Box sx={{ paddingRight: 1.5, marginTop: 0.5 }}>
                        {activeView.icon && <activeView.icon />}
                      </Box>
                      {activeView.name}
                    </span>
                  )
                }}
                labelId={idLabel}
                label={'View'}
                id={selectId}
                onChange={(e) => {
                  const view = views.find((view) => view.id == e?.target?.value)
                  if (view) {
                    const pathSegments = location.pathname.split('/')
                    pathSegments[1] = view.id
                    const newPath = pathSegments.join('/')
                    if (newPath !== location.pathname + location.search) {
                      setActiveViewId(view.id)
                      navigate(newPath)
                    }
                  }
                }}
                sx={{
                  '& .MuiSelect-select': {
                    paddingRight: '36px !important',
                  },
                }}
                inputProps={{
                  sx: (theme: {
                    shape: any
                    palette: {
                      background: { paperOverlay: any; edgeLight: any }
                    }
                  }) => ({
                    display: 'flex',
                    alignItems: 'center',
                    backgroundColor: theme.palette.background.paperOverlay,
                    paddingTop: 0.75,
                    paddingLeft: 1,
                    paddingBottom: 0.5,
                    borderTopLeftRadius: theme.shape.borderRadius,
                    borderTopRightRadius: theme.shape.borderRadius,
                    borderStyle: 'solid',
                    borderWidth: 1,
                    borderColor: theme.palette.background.edgeLight,
                    ':focus': {
                      backgroundColor: theme.palette.background.paperOverlay,
                      borderRadius: 1,
                    },
                    '& legend': { display: 'none' },
                    '& fieldset': { top: 0 },
                  }),
                }}
              >
                <MenuItem disabled value=''>
                  Select a view
                </MenuItem>
                {userViews.map((view) => (
                  <MenuItem
                    key={view.id}
                    value={view.id}
                    style={{
                      display: userViews.some((u) => u.id == view.id)
                        ? 'flex'
                        : 'none',
                      paddingTop: 8,
                      paddingBottom: 8,
                      marginBottom: 0,
                    }}
                  >
                    <Box sx={{ paddingRight: 2, marginTop: 0.5 }}>
                      {view.icon && <view.icon />}
                    </Box>
                    <ListItemText
                      sx={{
                        textAlign: 'left',
                        color: 'secondary.contrastText',
                        textTransform: 'none',
                        fontWeight: 'regular',
                      }}
                      key={view.name}
                      onClick={(e) => {
                        if (view) setActiveViewId(view.id)
                      }}
                    >
                      {view.name}
                    </ListItemText>
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Stack>

          {/* <ViewOptions
            gene={gene}
            state={state}
            view={view}
            loading={loading}
            dispatch={dispatch}
          /> */}
          <Button
            variant='text'
            sx={{
              color: 'secondary.contrastText',
            }}
            disabled={loading}
            color='secondary'
            onClick={() => {
              setViewingCitations(true)
            }}
          >
            Data sources
          </Button>
          <Button
            variant='text'
            sx={{
              color: 'secondary.contrastText',
            }}
            disabled={loading}
            color='secondary'
            onClick={() => {
              // downloadFile(
              //   `${activeView.id}${gene ? '-' + gene.id : ''}.json`,
              //   JSON.stringify(activeData, null, 2)
              // )
            }}
          >
            Download data
          </Button>
        </Toolbar>
      </AppBar>
    )
  }, [activeViewId, gene?.id, loading, location])

  return (
    <Box {...props} display='flex' flexDirection='column'>
      <Modal open={viewingCitations} onClose={() => setViewingCitations(false)}>
        <DialogTitle sx={{ minWidth: '512px' }}>
          <Typography variant='h6'>
            Data sources for {activeView.name}
          </Typography>
        </DialogTitle>
        <DialogContent>
          {activeView.citation ? (
            // <view.citation state={state} activeData={activeData} gene={gene} />
            <div></div>
          ) : (
            <Box>No information provided for this view</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCitations(false)}>Close</Button>
        </DialogActions>
      </Modal>

      {topBar}
      <Box
        sx={(theme) => ({
          padding: '1rem',
          flexGrow: 1,
          display: 'flex',
          gap: theme.spacing(4),
          overflow: 'auto',
          borderStyle: 'solid',
          borderWidth: '0px 0px 0px 1px',
          borderColor: theme.palette.background.edgeLight,
          flexDirection: 'column',
          ...(printing
            ? {
                display: 'block !important',
                padding: 0,
                position: 'fixed',
                left: 0,
                top: 0,
                margin: 0,
                zIndex: 1e9,
                background: theme.palette.background.paper,
                width: '100%',
                minHeight: '100%',
              }
            : {}),
        })}
      >
        <ErrorBoundary>
          {/* Only show the gene header if a gene is selected and this view belongs to the gene */}
          {loading && loadAmount < 100 ? (
            <LoadingPage
              loadingAmount={loadAmount}
              gene={gene}
              view={activeView}
              error={null}
            />
          ) : (
            <>
              <Outlet
                context={{
                  geneticElement: gene,
                  setLoadAmount: setLoadAmount,
                  setIsLoading: setLoading,
                }}
              ></Outlet>
            </>
          )}
        </ErrorBoundary>
      </Box>
    </Box>
  )
}
