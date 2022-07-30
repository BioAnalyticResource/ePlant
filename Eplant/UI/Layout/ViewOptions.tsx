import HookMenu from '@eplant/util/hook-menu'

type ViewOptionsEntry =
  | { type: 'toggle'; label: string; checked: boolean }
  | { type: 'button'; onClick: () => void }

/**
 * A hook menu that renders a list of toggle buttons and buttons in a dropdown.
 *
 * @export
 * @class ViewOptions
 * @extends {HookMenu<ViewOptionsEntry>}
 */
export class ViewOptions extends HookMenu<ViewOptionsEntry> {
  constructor() {
    super()
  }
}
