# Accessibility Test Guide for Table Components

This document provides a comprehensive guide for testing and enhancing table components to ensure accessibility compliance with WCAG 2.1 guidelines. It covers general tests, zoom magnification, keyboard navigation, and screen reader compatibility.

## General Tests

### Color Usage and Contrast

- **Test: Color is not the only method used to convey meaning**
  - **Description**: When viewing the table, ensure that color alone does not convey critical information. Use additional visual cues like icons, text labels, or patterns.
  - **WCAG Level**: A (1.4.1 Use of color)
  - **Enhancement Guide**: If color is used to indicate status (e.g., red for errors), add text labels or icons that convey the same information.

- **Test: Table content meets color contrast requirements**
  - **Description**: Use ANDI or a color contrast analyzer to verify that contrast between table background and text is at least 4.5:1.
  - **WCAG Level**: AA (1.4.3 Contrast Minimum)
  - **Enhancement Guide**: Test all text combinations in the table. Adjust colors if contrast falls below 4.5:1.

## Zoom Magnification Tests

### Content Visibility at 200% Zoom

- **Test: Table content is visible and functional when magnified**
  - **Description**: At 200% zoom, ensure table content remains visible and does not overlap with other content.
  - **Enhancement Guide**: Test horizontal scrolling tables. Ensure focus indicators remain visible. Consider responsive design adjustments for zoomed content.

## Keyboard Navigation Tests

### Navigation and Focus Management

- **Test: Table elements can be navigated by keyboard**
  - **Description**: Navigate using arrow keys or tab key without unexpected behavior. Note: Scrollable tables may not scroll with left/right arrows in JAWS/NVDA.
  - **WCAG Level**: A (2.1.1 Keyboard)
  - **Enhancement Guide**: Implement proper keyboard navigation for sortable columns and interactive elements. Consider custom keyboard handlers for complex tables.

- **Test: Table cells do not trap focus**
  - **Description**: Users can easily navigate in and out of table cells using only keystrokes.
  - **WCAG Level**: A (2.1.2 No keyboard trap)
  - **Enhancement Guide**: Avoid focus traps in table cells. Ensure tab order flows logically through the table.

- **Test: Focus indicator is clear on interactive items**
  - **Description**: A visible focus indicator appears around all interactive elements (e.g., sorting arrows, links).
  - **WCAG Level**: AA (2.4.7 Focus visible)
  - **Enhancement Guide**: Style focus indicators with sufficient contrast and visibility. Test with high contrast mode enabled.

## Screen Reader Tests

### Content Structure and Navigation

- **Test: Table cells provide context**
  - **Description**: Screen readers speak one cell at a time and explain cell position in the table. Use Ctrl+Alt in JAWS for table navigation.
  - **WCAG Level**: A (1.3.1 Info and relationships)
  - **Enhancement Guide**: Use proper `<th>` elements and `scope` attributes. Consider `aria-describedby` for complex tables.

- **Test: Table cells read in logical order**
  - **Description**: Cells are read row by row in correct order (left to right for English).
  - **WCAG Level**: A (1.3.2 Meaningful sequence)
  - **Enhancement Guide**: Ensure DOM order matches visual order. Use CSS to maintain logical tab order.

- **Test: Merged headers are correctly associated**
  - **Description**: Screen readers understand data organization under merged header cells.
  - **WCAG Level**: AA (2.4.6 Headings and labels)
  - **Enhancement Guide**: Use `colspan` and `rowspan` appropriately. Provide `headers` attributes for complex spanning.

- **Test: Table headers are associated with cells**
  - **Description**: Screen readers announce column headers for data cells.
  - **WCAG Level**: AA (2.4.6 Headings and labels)
  - **Enhancement Guide**: Use `<th>` elements with `scope="col"` or `scope="row"`. Implement `aria-labelledby` if needed.

- **Test: Table elements have appropriate ARIA**
  - **Description**: Screen readers announce names, roles, and states of interactive elements. For sortable tables, announce sort direction.
  - **WCAG Level**: A (4.1.2 Name, role, value)
  - **Enhancement Guide**: Add `aria-sort` for sortable columns. Use `role="table"`, `role="row"`, `role="columnheader"`, `role="rowheader"` as needed.

## Testing Resources

- **Zoom Testing**: Use browser zoom or screen magnification tools
- **Keyboard Testing**: Test with Tab, Shift+Tab, arrow keys
- **Screen Reader Testing**: Use JAWS, NVDA, VoiceOver
- **Color Contrast**: Use ANDI, WebAIM contrast checker, or browser dev tools
- **Automated Testing**: Integrate axe-core or similar accessibility linters

## Implementation Checklist

- [ ] Review existing table components for compliance
- [ ] Implement missing ARIA attributes
- [ ] Test keyboard navigation thoroughly
- [ ] Verify screen reader compatibility
- [ ] Check color contrast ratios
- [ ] Test at 200% zoom magnification
- [ ] Document any WCAG deviations with justification
- [ ] Add automated accessibility tests to CI pipeline
