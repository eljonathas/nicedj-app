/* @vitest-environment jsdom */

import { fireEvent, render, screen } from '@testing-library/react'
import { ListMusic, Users } from 'lucide-react'
import { describe, expect, it } from 'vitest'
import { RoomCompactLayout } from './RoomCompactLayout'

function renderCompactLayout() {
  return render(
    <RoomCompactLayout
      roomName="Sala Demo"
      hostName="DJ Alice"
      activeUsersCount={12}
      currentUsername="Bob"
      currentUserAvatar={null}
      isViewportMobile
      stage={<div>Stage placeholder</div>}
      stageMedia={<div>Player placeholder</div>}
      controls={<div>Controls placeholder</div>}
      primaryAction={<div>Queue action placeholder</div>}
      chat={<div>Chat placeholder</div>}
      onOpenProfile={() => {}}
      sheetTabs={[
        {
          id: 'users',
          label: 'Pessoas',
          icon: Users,
          badge: 12,
          content: <div>Users placeholder</div>,
        },
        {
          id: 'queue',
          label: 'Fila',
          icon: ListMusic,
          badge: 4,
          content: <div>Queue placeholder</div>,
        },
      ]}
    />,
  )
}

describe('RoomCompactLayout', () => {
  it('keeps the stage visible while prioritizing controls and chat on mobile', () => {
    renderCompactLayout()

    expect(screen.getByText('Stage placeholder')).toBeTruthy()
    expect(screen.getByText('Player placeholder')).toBeTruthy()
    expect(screen.getByText('Controls placeholder')).toBeTruthy()
    expect(screen.getByText('Queue action placeholder')).toBeTruthy()
    expect(screen.getByText('Chat placeholder')).toBeTruthy()
    expect(screen.getAllByTestId('room-view-cta-users')[0]).toBeTruthy()
    expect(screen.getAllByTestId('room-view-cta-queue')[0]).toBeTruthy()
    expect(screen.queryByLabelText('Fechar painel da sala')).toBeNull()
    expect(screen.queryByRole('tablist')).toBeNull()
  })

  it('opens each mobile room view through its own CTA without rendering tabs inside the sheet', async () => {
    renderCompactLayout()

    fireEvent.click(screen.getAllByTestId('room-view-cta-users')[0])
    expect(await screen.findByText('Users placeholder')).toBeTruthy()
    expect(screen.getAllByText('Stage placeholder')[0]).toBeTruthy()
    expect(screen.queryByRole('tablist')).toBeNull()

    fireEvent.click(screen.getAllByLabelText('Fechar painel da sala').at(-1)!)

    fireEvent.click(screen.getAllByTestId('room-view-cta-queue')[0])
    expect(await screen.findByText('Queue placeholder')).toBeTruthy()
    expect(screen.queryByText('Users placeholder')).toBeNull()

    fireEvent.click(screen.getAllByLabelText('Fechar painel da sala').at(-1)!)
  })
})
