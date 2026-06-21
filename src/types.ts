export interface Style {
  id: string
  label: string
  color: string
}

export interface Video {
  title: string
  youtubeId: string
}

export interface Link {
  label: string
  url: string
}

export interface Position {
  x: number
  y: number
}

export interface Band {
  id: string
  name: string
  /** data-URI (upload) ou URL externe. Vide = pas de logo. */
  logo: string
  /** 1 style minimum ; le 1er détermine le cluster d'appartenance. */
  styles: string[]
  info: string
  videos: Video[]
  links: Link[]
  concertsUrl: string
  /** Position relative au cluster parent. */
  position: Position
}

export interface BandDatabase {
  version: number
  styles: Style[]
  bands: Band[]
}
