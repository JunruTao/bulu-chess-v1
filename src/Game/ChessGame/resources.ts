import { GameUtils, MoveTypes, PieceList } from "../../../amplify/shared/game"

export const getTextureSheet = () => {
  const TexturesSheet = {
    // BOARD
    board0: "board/b0.png",
    board1: "board/b1.png",
    board10: "board/b10.png",
    board11: "board/b11.png",
    board66: "board/b99.png",
    board99: "board/b99.png",
    // CURSORS
    cs_active: "cursor/cs_active.png",
    cs_aim: "cursor/cs_aim.png",
    cs_cannon: "cursor/cs_cannon.png",
    cs_prev: "cursor/cs_prev.png",
    // BALLS
    ball_w: "balls/ball_w.png",
    ball_b: "balls/ball_b.png",
  } as { [key: string]: string }

  // SELECTORS
  MoveTypes.forEach((moveType) => {
    TexturesSheet[`mv_${moveType.toLowerCase()}`] = `moves/mv_${moveType.toLowerCase()}.png`
  })

  // PIECES
  PieceList.forEach((piece) => {
    const color = GameUtils.getPieceColor(piece)
    TexturesSheet[`piece_${piece}_lod0`] = `piece/lod0/${color}_${piece}_lod0.png`
    TexturesSheet[`piece_${piece}_lod1`] = `piece/lod1/${color}_${piece}_lod1.png`
  })

  return TexturesSheet
}
