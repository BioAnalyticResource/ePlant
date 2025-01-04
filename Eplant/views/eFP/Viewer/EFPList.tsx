import { memo, startTransition } from 'react'
import {
  areEqual,
  FixedSizeList as List,
  ListChildComponentProps,
} from 'react-window'

import { Tooltip } from '@mui/material'

import EFPPreview from '../EFPPreview'

import { EFPListProps } from './types'

const EFPListItem = memo(
  function EFPRow({ index: i, data }: { index: number; data: EFPListProps }) {
    return (
      <Tooltip placement='right' arrow title={<div>{data.views[i].name}</div>}>
        <div>
          <EFPPreview
            sx={() => ({
              width: '108px',
              height: '75px',
              zIndex: 100,
            })}
            data={data.viewData[i]}
            key={data.views[i].id}
            // Why is this an error? It is guarded by the above check.
            gene={data.geneticElement}
            selected={data.views[i].id == data.activeView.id}
            view={data.views[i]}
            maskThreshold={data.maskThreshold}
            onClick={() => {
              startTransition(() => {
                data.setActiveView(data.views[i].id)
              })
            }}
            colorMode={data.colorMode}
            maskingEnabled={data.maskingEnabled}
            transform={data.transform}
          />
        </div>
      </Tooltip>
    )
  },
  (prev, next) => {
    return (
      prev.data.views[prev.index].id === next.data.views[next.index].id &&
      prev.data.colorMode === next.data.colorMode &&
      prev.data.geneticElement.id === next.data.geneticElement.id &&
      prev.data.activeView === next.data.activeView &&
      prev.index == next.index &&
      prev.data.maskingEnabled == next.data.maskingEnabled &&
      prev.data.maskThreshold == next.data.maskThreshold &&
      prev.data.transform == next.data.transform
    )
  }
)

const EFPListRow = memo(function EFPListRow({
  style,
  index,
  data,
}: ListChildComponentProps) {
  return (
    <div style={style}>
      <EFPListItem index={index} data={data} />
    </div>
  )
}, areEqual)

export const EFPListMemoized = function EFPList(props: EFPListProps) {
  return (
    <List
      height={props.height}
      itemCount={props.views.length}
      itemSize={75 + 12}
      width={130}
      style={{
        zIndex: 10,
        scrollbarWidth: 'none',
      }}
      itemData={props}
    >
      {EFPListRow}
    </List>
  )
}
