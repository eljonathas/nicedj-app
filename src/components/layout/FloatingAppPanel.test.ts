/* @vitest-environment jsdom */

import { describe, expect, it } from 'vitest'
import { getFloatingPanelBounds } from './FloatingAppPanel'

describe('getFloatingPanelBounds', () => {
  it('keeps the desktop sidebar offset when the room uses the full desktop layout', () => {
    expect(
      getFloatingPanelBounds({
        isMobile: false,
        isRoomCompactLayout: false,
        roomSidebarWidth: 336,
      }),
    ).toEqual({
      top: 0,
      right: 336,
      bottom: 0,
      left: 82,
    })
  })

  it('uses full content bounds when the room is in compact layout on tablet widths', () => {
    expect(
      getFloatingPanelBounds({
        isMobile: false,
        isRoomCompactLayout: true,
        roomSidebarWidth: 336,
      }),
    ).toEqual({
      top: 0,
      right: 0,
      bottom: 0,
      left: 82,
    })
  })

  it('preserves mobile header and tab bar offsets in compact mobile layouts', () => {
    expect(
      getFloatingPanelBounds({
        isMobile: true,
        isRoomCompactLayout: true,
        roomSidebarWidth: 336,
      }),
    ).toEqual({
      top: 57,
      right: 0,
      bottom: 57,
      left: 0,
    })
  })
})
