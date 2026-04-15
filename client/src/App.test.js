import { render, screen } from '@testing-library/react';
import { BrowserRouter } from "react-router-dom";
import App from './App';

test("renders coordinator dashboard heading", () => {
  render(
    <BrowserRouter>
      <App />
    </BrowserRouter>
  );
  const headingElement = screen.getByText(/placement coordinator module/i);
  expect(headingElement).toBeInTheDocument();
});
