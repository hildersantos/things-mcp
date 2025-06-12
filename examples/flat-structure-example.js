// Example: Correct flat structure for Things MCP project items

// CORRECT - Flat structure with headings as siblings
const correctProjectStructure = {
  title: "Trip to Paris",
  items: [
    { type: "heading", title: "Day 1 - Arrival" },
    { type: "todo", title: "Check into hotel" },
    { type: "todo", title: "Walk around Montmartre" },
    { type: "todo", title: "Dinner at local bistro" },
    
    { type: "heading", title: "Day 2 - Museums" },
    { type: "todo", title: "Visit the Louvre", notes: "Book tickets in advance" },
    { type: "todo", title: "Lunch at museum cafe" },
    { type: "todo", title: "Musée d'Orsay in afternoon" },
    
    { type: "heading", title: "Day 3 - Sightseeing" },
    { type: "todo", title: "Eiffel Tower morning visit" },
    { type: "todo", title: "Seine river cruise" },
    { type: "todo", title: "Notre-Dame Cathedral" }
  ]
};

// INCORRECT - Old nested structure (no longer supported)
const incorrectNestedStructure = {
  title: "Trip to Paris",
  items: [
    { 
      type: "heading", 
      title: "Day 1 - Arrival",
      items: [  // ❌ This nested structure is incorrect
        { type: "todo", title: "Check into hotel" },
        { type: "todo", title: "Walk around Montmartre" }
      ]
    }
  ]
};

// The flat structure correctly represents how Things 3 handles headings:
// - Headings are visual dividers, not containers
// - Todos that follow a heading are visually grouped under it
// - All items are siblings in a single flat array
// - Order matters - todos appear under the most recent heading

console.log("Use the flat structure for Things MCP projects!");