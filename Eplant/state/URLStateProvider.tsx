import React, {
  createContext,
  ReactNode,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react'
import { debounce } from 'lodash'
import { useSearchParams } from 'react-router-dom'
import { AnyZodObject } from 'zod'

import { flattenObject, getStateFromParams, getZodDefaults } from './stateUtils'
import { useActiveViewId } from '.'

interface URLStateContext<T> {
  state: T | null
  setState: (updatedState: T) => void
  initializeState: (schema: AnyZodObject) => void
}

const URLStateContext = createContext<URLStateContext<any>>({
  state: null,
  setState: () => {
    throw new Error('setState must be used within a URLStateProvider')
  },
  initializeState: () => {
    throw new Error('initializeState must be used within a URLStateProvider')
  },
})

export const URLStateProvider = ({ children }: { children: ReactNode }) => {
  const [activeViewId] = useActiveViewId()
  const [searchParams, setSearchParams] = useSearchParams()
  const stateCache = useRef(new Map<string, any>())
  const [state, setState] = useState<any>(() => {
    null
  })

  const debouncedUpdateSearchParams = useCallback(
    debounce((updatedState: any) => {
      // Setting component state
      stateCache.current.set(activeViewId, updatedState)

      // Setting params
      const flattenedState = flattenObject(updatedState)
      setSearchParams(new URLSearchParams(flattenedState as any))
    }, 50),
    [activeViewId]
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
      // Get validated state
      const defaultState = getZodDefaults(schema) // This returns the defaults defined by Zod Schema
      const paramsState = getStateFromParams(schema, searchParams)
      const cachedState = stateCache.current.get(activeViewId) || {}
      // Merge precedence: search params > cached state > defaults
      const mergedState = {
        ...defaultState,
        ...cachedState,
        ...paramsState,
      }
      setState(mergedState)
    },
    [searchParams, activeViewId]
  )

  return (
    <URLStateContext.Provider
      value={{
        state,
        setState: (updatedState) => setState(updatedState),
        initializeState,
      }}
    >
      {children}
    </URLStateContext.Provider>
  )
}

export const useURLState = <T,>() => {
  const context = useContext(URLStateContext)
  if (!context.setState) {
    throw new Error('useURLState must be used within a URLStateProvider')
  }
  return context as URLStateContext<T>
}
