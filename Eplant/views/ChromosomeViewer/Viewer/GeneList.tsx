// -------
// IMPORTS
// -------
import React, { FC, useEffect, useState } from 'react'

import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import useTheme from '@mui/material/styles/useTheme'

import { GeneItem } from '../types'

import GeneInfoPopup from './GeneInfoPopup'

// TYPES
interface GeneListProps {
  id: string
  start: number
  end: number
  anchorOrigin: number[]
}

//----------
// COMPONENT
//----------
const GeneList: FC<GeneListProps> = ({ id, start, end, anchorOrigin }) => {
  // gene list
  const [geneList, setGeneList] = useState<GeneItem[]>([])
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [selectedGene, setSelectedGene] = useState<GeneItem | null>(null)

  // gene info popup
  const [open, setOpen] = useState(false)

  // Other/Global State
  const theme = useTheme()

  useEffect(() => {
    const poplar = false // switch to true for poplar species to work

    fetch(
      `https://bar.utoronto.ca/eplant${
        poplar ? '_poplar' : ''
      }/cgi-bin/querygenesbyposition.cgi?chromosome=${id}&start=${start}&end=${end}`
    )
      .then((response) => response.json())
      .then((json) => setGeneList(json))
      .catch((err) => console.log(err))
  }, [])
  // --------------
  // EVENT HANDLERS
  // --------------
  const handleClick = (event: React.MouseEvent<HTMLElement>) => {
    setOpen(true)
  }
  const handleGeneSelect = (gene: GeneItem, index: number) => () => {
    setSelectedIndex(index)
    setSelectedGene(gene)
  }

  return (
    <>
      {/* GENE LIST */}
      <List sx={{ padding: 0 }} onClick={handleClick}>
        {geneList.map((gene, i) => {
          return (
            <ListItem
              key={i}
              disablePadding
              sx={{
                height: 18,
              }}
            >
              {/* GENE LIST ITEM (rendered as  button) */}
              <ListItemButton
                selected={i === selectedIndex}
                onClick={handleGeneSelect(gene, i)}
                sx={{
                  height: 18,
                  borderRadius: 0,
                  padding: 0,
                  paddingInline: '2px',
                }}
              >
                <ListItemText
                  sx={{
                    '& .MuiListItemText-primary': {
                      fontSize: '10px',
                      textOverflow: 'ellipsis',
                      textWrap: 'nowrap',
                    },
                  }}
                >
                  <span className='geneId'>{gene.id}</span>
                  {gene.aliases.length != 0 && (
                    <span
                      className='geneAliases'
                      style={{ color: theme.palette.secondary.main }}
                    >
                      {`/${gene?.aliases[0]}`}
                    </span>
                  )}
                </ListItemText>
              </ListItemButton>
            </ListItem>
          )
        })}
      </List>
      {/* GENE INFO POPUP */}
      {selectedGene != null && (
        <GeneInfoPopup
          gene={selectedGene}
          open={open}
          anchorOrigin={anchorOrigin}
        ></GeneInfoPopup>
      )}
    </>
  )
}

export default GeneList
