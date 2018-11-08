export default function (type, attrs) {
  return (state, dispatch) => {
    const { from, to } = state.selection
    return dispatch(state.tr.addMark(from, to, type.create(attrs)))
  }
}
