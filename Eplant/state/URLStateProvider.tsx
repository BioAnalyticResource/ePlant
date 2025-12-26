import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import { debounce } from 'lodash'
import {
  useLocation,
  useNavigate,
  useParams,
  useSearchParams,
} from 'react-router-dom'
import { AnyZodObject } from 'zod'

import { useConfig } from '@eplant/config'
import GeneInfoViewMetadata from '@eplant/views/GeneInfoView'

import {
  flattenObject,
  getStateFromParams,
  getViewIdFromPathname,
  getZodDefaults,
} from './stateUtils'
import {
  useActiveGeneId,
  useActiveViewId,
  useGeneticElements,
  useSpecies,
} from '.'

interface URLStateContext<T> {
  state: T | null
  setState: (updatedState: T) => void
  initializeState: (schema: AnyZodObject) => void
  currentStateViewIdRef: React.MutableRefObject<string | null>
}

const URLStateContext = createContext<URLStateContext<any>>({
  state: null,
  setState: () => {
    throw new Error('setState must be used within a URLStateProvider')
  },
  initializeState: () => {
    throw new Error('initializeState must be used within a URLStateProvider')
  },
  currentStateViewIdRef: { current: null },
})

export const URLStateProvider = ({ children }: { children: ReactNode }) => {
  const [state, setState] = useState<any>(() => {
    null
  })
  const [activeViewId, setActiveViewId] = useActiveViewId()
  const [searchParams, setSearchParams] = useSearchParams()
  const stateCache = useRef(new Map<string, any>())
  const currentStateViewIdRef = useRef<string | null>(null)
  const { views } = useConfig()
  const location = useLocation()
  const navigate = useNavigate()
  const [speciesList] = useSpecies()
  const [genes, setGenes] = useGeneticElements()
  const [activeGeneId, setActiveGeneId] = useActiveGeneId()
  const [geneNotFound, setGeneNotFound] = useState(false)
  const params = useParams()

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
        setActiveGeneId('')
      }
    }
    if (params.geneid) {
      if (params.geneid !== activeGeneId) {
        if (!genes.find((g) => g.id === params.geneid)) {
          loadGene(params.geneid)
        }
        if (!geneNotFound) setActiveGeneId(params.geneid)
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
      GeneInfoViewMetadata

    setActiveViewId(urlView.id)
  }, [])

  // On when the activegene or view changes, update path
  useEffect(() => {
    const oldPathSegments = location.pathname
      .split('/')
      .filter((segment) => segment !== '')

    const newPathSegments = []
    if (activeViewId) {
      newPathSegments.push(activeViewId)
    }
    if (activeGeneId) {
      newPathSegments.push(activeGeneId)
    }

    if (newPathSegments.length > 0) {
      let newPath
      if (
        oldPathSegments.length > 0 &&
        oldPathSegments[0] == newPathSegments[0]
      ) {
        // If the view is the same we want to retain query params in url, else we can wipe
        // them and have URLStateManager handle things
        newPath = '/' + newPathSegments.join('/') + location.search
      } else {
        newPath = '/' + newPathSegments.join('/')
      }
      navigate(newPath)
    }
  }, [activeGeneId, activeViewId])

  const debouncedUpdateSearchParams = useCallback(
    debounce((updatedState: any) => {
      // Get current view ID from location to ensure correct caching
      const currentViewId = getViewIdFromPathname(location.pathname)
      stateCache.current.set(currentViewId, updatedState)

      // Setting params
      const flattenedState = flattenObject(updatedState)
      setSearchParams(new URLSearchParams(flattenedState as any))
    }, 50),
    [location.pathname, setSearchParams]
  )

  useEffect(() => {
    if (state) {
      debouncedUpdateSearchParams(state)
    }
    return () => {
      debouncedUpdateSearchParams.cancel()
    }
  }, [state, debouncedUpdateSearchParams])

  const initializeState = useCallback(
    <T extends AnyZodObject>(schema: T) => {
      const currentViewId = getViewIdFromPathname(location.pathname)

      const defaultState = getZodDefaults(schema)
      const paramsState = getStateFromParams(schema, searchParams)
      const cachedState = stateCache.current.get(currentViewId) || {}

      // Merge precedence: search params > cached state > defaults
      const mergedState = {
        ...defaultState,
        ...cachedState,
        ...paramsState,
      }

      // Track which view ID this state belongs to
      currentStateViewIdRef.current = currentViewId
      setActiveViewId(currentViewId)
      setState(mergedState)
    },
    [searchParams, location.pathname]
  )

  return (
    <URLStateContext.Provider
      value={{
        state,
        setState: (updatedState) => setState(updatedState),
        initializeState,
        currentStateViewIdRef,
      }}
    >
      {children}
    </URLStateContext.Provider>
  )
}

export const useURLState = <T,>() => {
  const context = useContext(URLStateContext)
  const location = useLocation()

  if (!context.setState) {
    throw new Error('useURLState must be used within a URLStateProvider')
  }

  const currentUrlViewId = useMemo(
    () => getViewIdFromPathname(location.pathname),
    [location.pathname]
  )

  // Clear state to avoid
  const safeState =
    currentUrlViewId === context.currentStateViewIdRef.current
      ? context.state
      : null

  return {
    ...context,
    state: safeState,
  } as URLStateContext<T>
}
