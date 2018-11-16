export default function (type) {
  return (state, dispatch) => {
    const { from, to } = state.selection
    return dispatch(state.tr.removeMark(from, to, type))
  }
}
