import { useEffect,useMemo,useRef, useState } from "react"
import cytoscape, { Core, ElementsDefinition, warnings } from 'cytoscape'
import { useOutletContext } from "react-router-dom"

import { useTheme } from "@emotion/react"
import GeneticElement from "@eplant/GeneticElement"
import { useURLState } from "@eplant/state/URLStateProvider"
import { ViewContext } from "@eplant/UI/Layout/ViewContainer/types"
import { ViewDataError } from "@eplant/View"
import { Close } from "@mui/icons-material"
import { Alert, IconButton,Snackbar } from "@mui/material"
import { useQuery } from "@tanstack/react-query"

import Topbar from "./components/Topbar"
import { addEdgeListener,addNodeListener } from "./scripts/eventHandlers"
import setLayout from "./scripts/layout"
import loadInteractions from "./scripts/loadInteractions"
import cytoStyles from "./cytoStyles"
import { Interaction, InteractionsViewData, InteractionsViewState, InteractionsViewStateSchema, ViewData } from "./types"


export const InteractionsViewObject = () => {
    /** Get context from parent (geneticElement, plus loading callbacks) */
    const { geneticElement, setIsLoading, setLoadAmount } =
    useOutletContext<ViewContext>()

    /** Manage URL-synchronized state */
    const { state, setState, initializeState } =
    useURLState<InteractionsViewState>()

    /**
     * Load interactions data with React Query.
     */
    const { data, isLoading, isError, error } = useQuery<InteractionsViewData>({
    queryKey: [`interactions-viewer-${geneticElement?.id}`],
    queryFn: async () => {
        return InteractionsViewLoader(geneticElement, setLoadAmount)
    },
    enabled: !!geneticElement,
    })

    /**
     * Initialize Interactions view state from URL or defaults on first mount
     */
    useEffect(() => {
    initializeState(InteractionsViewStateSchema)
    }, [initializeState])

    /**
     * Let the parent know if we are currently loading data
     */
    useEffect(() => {
    setIsLoading(isLoading)
    }, [isLoading, setIsLoading])

    /** Get interactionsData from the returned data */
    const interactionsData = data?.viewData

    const [cyto, setCyto] = useState<Core | null>(null)
    const cyRef = useRef(null)
    const cyContainerRef = useRef<HTMLDivElement>(null)
    const theme = useTheme()
    const geneId = geneticElement?.id
    const viewData = interactionsData || {
        nodes: [],
        edges: [],
        loadFlags: {
          empty: true,
          existsPDI: false,
          existsPPI: false,
          recursive: false,
        },
    }
    
    const elements: any = [...(viewData.nodes || []), ...(viewData.edges || [])]
    
    // Snackbar state
    const [snackbarOpen, setSnackbarOpen] = useState(true)

    // Track if transform is being applied from URL state to prevent circular updates
    const isApplyingTransform = useRef(false)

    // Initialize or reinitialize cytoscape when data changes or gene changes
    useEffect(() => {
      // Don't proceed if we're still loading or don't have a container
      if (isLoading || !cyContainerRef.current) return;
      
      // Clean up any existing instance
      if (cyto) {
          cyto.destroy();
      }
      
      // Create a new instance with the current elements
      const cy: Core = cytoscape({
          container: cyContainerRef.current,
          style: cytoStyles,
          elements: elements
      });
      
      // Add event listeners
      addNodeListener(cy);
      addEdgeListener(cy);
      
      // Apply layout if we have data
      if (elements.length > 0) {
          // Set the layout
          setLayout(cy, viewData.loadFlags);
          
          // Force a complete layout run to ensure positions are calculated
          const layout = cy.layout({
              name: 'preset',
              fit: false  // Don't fit automatically, we'll handle this manually
          });
          
          // Execute the layout with a callback
          layout.run();
          
          // Set up listener for viewport changes (pan/zoom) to update URL state
          cy.on('viewport', () => {
              // Skip update if we're currently applying transform from URL
              if (isApplyingTransform.current) return;
              
              const zoom = cy.zoom();
              const pan = cy.pan();
              
              setState({
                  transform: {
                      offset: {
                          x: pan.x,
                          y: pan.y
                      },
                      zoom: zoom
                  }
              });
          });
          
          // Wait for layout to stop, then apply transform or fit
          cy.one('layoutstop', () => {
              // Give time for rendering to complete
              setTimeout(() => {
                  // First fit the graph properly to center it
                  cy.fit();
                  cy.center();
                  
                  // Then apply transform from URL if available
                  if (state?.transform) {
                      isApplyingTransform.current = true;
                      
                      // Apply the saved transform
                      cy.zoom(state.transform.zoom);
                      cy.pan({
                          x: state.transform.offset.x,
                          y: state.transform.offset.y
                      });
                      
                      // Reset flag after transform completes
                      setTimeout(() => {
                          isApplyingTransform.current = false;
                      }, 100);
                  }
              }, 100);
          });
      } else {
          // If no elements, just center and fit the view
          cy.fit();
          cy.center();
      }
      
      cy.style().update();
      setCyto(cy);
      
      // When component unmounts, clean up
      return () => {
          if (cy) {
              cy.destroy();
          }
      };
    }, [geneId, isLoading, elements.length]);


    useEffect(() => {
      if (!cyto || !state?.transform || isLoading || elements.length === 0) return;
      
      // Only apply transform if this is different from the current view
      const currentZoom = cyto.zoom();
      const currentPan = cyto.pan();
      
      // Check if transform has actually changed to avoid unnecessary updates
      const zoomChanged = Math.abs(currentZoom - state.transform.zoom) > 0.001;
      const panChanged = 
          Math.abs(currentPan.x - state.transform.offset.x) > 1 ||
          Math.abs(currentPan.y - state.transform.offset.y) > 1;
      
      if (zoomChanged || panChanged) {
          // Prevent triggering viewport event listener
          isApplyingTransform.current = true;
          
          // Apply transform from URL state
          cyto.zoom(state.transform.zoom);
          cyto.pan({
              x: state.transform.offset.x,
              y: state.transform.offset.y
          });
          
          // Reset flag after a longer delay to ensure completion
          setTimeout(() => {
              isApplyingTransform.current = false;
          }, 100);
      }
    }, [cyto, state?.transform?.zoom, state?.transform?.offset.x, state?.transform?.offset.y]);

    /**
     * Function to close the Snackbar */
    const handleCloseSnackbar = () => {
      setSnackbarOpen(false)
    }

    return (
      <div style={{ background: 'white', overflow: 'hidden' }}>
        {/* TOPBAR - contains legend and filter buttons */}
        {cyto && <Topbar cy={cyto} gene={geneId ?? ''} />}
        {/* CYTOSCAPE - container to render cytoscape */}
        <div
          ref={cyContainerRef}
          id='cy'
          style={{ width: '100%', height: '80vh' }}
        ></div>
        {/* SNACKBAR - alerts user what to do if protein localization colours are not visible*/}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={5000} // Auto-hide after 5 seconds
          onClose={handleCloseSnackbar}
          anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
          sx={{
            '& .MuiSnackbar-root': {
              bottom: '50px',
              right: '24px',
            },
          }}
        >
          <Alert
            onClose={handleCloseSnackbar}
            severity='info'
            color='success'
            sx={(theme) => ({
              '& .MuiAlert-icon': {
                color: theme.palette.primary.main, // Change the icon color if needed
                marginTop: '5px',
              },
              width: '300px',
              fontSize: '0.875rem',
              padding: '8px 16px',
              maxHeight: '100px', // Limit height
              overflow: 'auto', // Add scroll if content overflows
            })}
            action={
              <IconButton
                color='secondary'
                title='Close'
                onClick={handleCloseSnackbar} // Close the Snackbar when clicked
              >
                <Close />
              </IconButton>
            }
          >
            Are protein localization colours not visible? Interact with the view
            to fix
          </Alert>
        </Snackbar>
      </div>
    )
}

/**
 * Data loader function for Interactions View
 * Separated from component as per new architecture
 */
export const InteractionsViewLoader = async (
  geneticElement: GeneticElement | null,
  loadEvent: (loaded: number) => void
): Promise<InteractionsViewData> => {
  if (!geneticElement) throw ViewDataError.UNSUPPORTED_GENE
  
  let data: ViewData = {
    nodes: [],
    edges: [],
    loadFlags: {
      empty: true,
      existsPDI: false,
      existsPPI: false,
      recursive: false,
    }
  }
  
  if (geneticElement) {
    let recursive: string, interactions: Array<Interaction>
    const query = geneticElement.id.toUpperCase()
    const url =
      'https://bar.utoronto.ca/eplant/cgi-bin/get_interactions_dapseq.py?locus=' +
      query
    try {
      // Fetch interaction data
      loadEvent(25) // Start progress
      const response = await fetch(url)
      loadEvent(50) // Halfway
      const json = await response.json()
      const interactionsData = json[query]

      if (interactionsData === undefined) {
        recursive = 'false'
        interactions = []
      } else {
        // recursive is always the last element in the array
        recursive = interactionsData[interactionsData.length - 1]
        // the interaction are everything else
        interactions = interactionsData.slice(0, interactionsData.length - 1)
      }
      // Load interactions
      loadEvent(75)
      data = loadInteractions(geneticElement, interactions, recursive)
      loadEvent(100) // Complete
    } catch (error) {
      console.error("Error loading interactions:", error)
      throw ViewDataError.UNSUPPORTED_GENE
    }
  }
  return {
    viewData: data,
  }
}

