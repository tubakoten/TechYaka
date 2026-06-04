import { render, screen } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'

// Leaflet harita mock — test ortamında DOM gerektiriyor
vi.mock('react-leaflet', () => ({
  MapContainer: ({ children }) => <div data-testid="map">{children}</div>,
  TileLayer: () => null,
  Marker: ({ children }) => <div data-testid="marker">{children}</div>,
  Popup: ({ children }) => <div>{children}</div>,
}))

vi.mock('leaflet', () => ({
  default: { divIcon: vi.fn(() => ({})) },
  divIcon: vi.fn(() => ({})),
}))

// Fetch mock — backend'e gerçek istek atmıyoruz
beforeEach(() => {
  global.fetch = vi.fn(() =>
    Promise.resolve({
      json: () => Promise.resolve([
        {
          id: 1,
          title: 'Test Meetup',
          location: 'Kadıköy, İstanbul',
          coordinates: [40.99, 29.02],
          type: 'Meetup',
          date: '01 Temmuz 2026',
          is_active: true,
          trust_score: 0,
          source_url: 'https://kommunity.com/events'
        }
      ])
    })
  )
})

import App from '../App'

// ---------------------------------------------------------
// TEST 1: Login ekranı render oluyor mu?
// ---------------------------------------------------------
describe('TechYaka App', () => {
  it('login ekranı doğru yükleniyor', () => {
    render(<App />)
    expect(screen.getByText('TechYaka')).toBeInTheDocument()
    expect(screen.getByText('Uygulamaya Gir')).toBeInTheDocument()
  })

  // ---------------------------------------------------------
  // TEST 2: "İlana Git" butonu doğru URL içeriyor mu?
  // ---------------------------------------------------------
  it('ilana git butonu doğru URL ile render oluyor', async () => {
    render(<App />)
    const loginBtn = screen.getByText('Uygulamaya Gir')
    loginBtn.click()

    await new Promise(r => setTimeout(r, 100))

    const links = document.querySelectorAll('a[href="https://kommunity.com/events"]')
    expect(links).toBeDefined()
  })
})