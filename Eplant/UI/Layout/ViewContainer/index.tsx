import { useEffect, useState } from 'react'
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
import Modal from '@eplant/UI/Modal'
import ErrorBoundary from '@eplant/util/ErrorBoundary'
import { StateAction, ViewDataError } from '@eplant/View'
import GeneInfoView from '@eplant/views/GeneInfoView'
import {
  Box,
  BoxProps,
  Button,
  DialogActions,
  DialogContent,
  DialogTitle,
  Typography,
} from '@mui/material'

import LoadingPage from './LoadingPage'
import { TopBar } from './Topbar'

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
  const [loading, setLoading] = useState(false)
  const [loadAmount, setLoadAmount] = useState(0)
  const [printing, setPrinting] = usePrinting()

  const [viewingCitations, setViewingCitations] = useState(false)

  const { views } = useConfig()
  const navigate = useNavigate()
  const location = useLocation()
  const params = useParams()
  const [speciesList] = useSpecies()
  const [genes, setGenes] = useGeneticElements()
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [activeViewId, setActiveViewId] = useActiveViewId()
  const [geneNotFound, setGeneNotFound] = useState(false)

  // On app url change, make sure loaded gene and view aligns with URL
  useEffect(() => {
    const loadGene = async (geneid: string) => {
      // TODO: This is super jank, should probably write some better utilities for loading genes
      const species = speciesList.find(
        (species) => species.name === 'Arabidopsis'
      )
      const newGene = await species?.api.searchGene(geneid)
      if (newGene) {
        setGenes([...genes, newGene])
      } else {
        setGeneNotFound(true)
      }
    }
    if (params.geneid) {
      if (params.geneid !== activeGeneId) {
        if (!genes.find((g) => g.id === params.geneid)) {
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

    // Set activeview
    const urlView =
      views.find((view) => view.id === location.pathname.split('/')[1]) ??
      GeneInfoView
    setActiveViewId(urlView.id)
  }, [])

  // On active gene change update the gene path segment
  useEffect(() => {
    if (location.pathname !== import.meta.env.BASE_URL) {
      // Only run this after initial redirect
      const pathSegments = location.pathname
        .split('/')
        .filter((segment) => segment !== '')
      if (pathSegments.length == 2 && gene) {
        pathSegments[pathSegments.length - 1] = activeGeneId
      } else if (pathSegments.length == 1 && gene) {
        pathSegments.push(activeGeneId)
        // Will never get here as of now, but if we decide to persist activeGene need
        // to do this.
      } else {
        // No gene selected, remove gene path segment
        pathSegments.pop()
      }
      const newPath = '/' + pathSegments.join('/') + '/' + location.search
      if (newPath !== location.pathname + '/' + location.search) {
        navigate(newPath)
      }
    }
  }, [activeGeneId, gene])

  useEffect(() => {
    const pathSegments = location.pathname.split('/')
    pathSegments[1] = activeViewId
    const newPath = pathSegments.join('/')
    if (newPath !== location.pathname + location.search) {
      navigate(newPath)
    }
  }, [activeViewId])

  // Get activeview object after everything resolves
  const activeView =
    views.find((view) => view.id === activeViewId) ?? GeneInfoView
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
            <activeView.citation />
          ) : (
            <Box>No information provided for this view</Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setViewingCitations(false)}>Close</Button>
        </DialogActions>
      </Modal>

      <TopBar
        activeView={activeView}
        loading={loading}
        setViewingCitations={setViewingCitations}
      />
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

          {!gene ? (
            <LoadingPage
              loadingAmount={loadAmount}
              gene={gene}
              view={activeView}
              error={ViewDataError.UNSUPPORTED_GENE}
            />
          ) : loading && loadAmount < 100 ? (
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
