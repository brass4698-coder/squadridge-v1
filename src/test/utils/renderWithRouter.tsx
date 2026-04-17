import { type ReactElement } from 'react';
import { render } from '@testing-library/react';
import { MemoryRouter, type MemoryRouterProps } from 'react-router-dom';

type Options = Omit<MemoryRouterProps, 'children'>;

/**
 * RTL render wrapped in `MemoryRouter` for route-aware components.
 */
export function renderWithRouter(ui: ReactElement, options: Options = {}) {
  const { initialEntries = ['/'], ...rest } = options;
  return render(
    <MemoryRouter initialEntries={initialEntries} {...rest}>
      {ui}
    </MemoryRouter>,
  );
}
