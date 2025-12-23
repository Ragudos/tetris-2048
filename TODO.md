## Modularize Everything

Everything, if possible, should be plug 'n play. There'll be a 'concrete'
kind of directory where we can include the proper implementations. Where, per each
file/module, we don't need to worry about the implementation of others.

- [ ] Input & Input map
- [ ] Config
- [ ] Serialization & Deserialization
- [ ] Events (Use event-driven architecture for effects, analytics, and such.)
- [ ] State (So, if, say, Ghost isn't needed, we don't calculate for it)
- [ ] Renderer (So, we can add effects, looks, etc.)
- [ ] Renderer & State (selectors for a renderer.)
