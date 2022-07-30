import HookMenu from '@eplant/util/hook-menu'

type ViewOptionsEntry =
  | { type: 'toggle'; label: string; checked: boolean }
  | { type: 'button'; onClick: () => void }

export class ViewOptions extends HookMenu<ViewOptionsEntry> {
  constructor() {
    super()
  }
}
