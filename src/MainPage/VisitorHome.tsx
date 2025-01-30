import { FC } from "react"
import "./VisitorHome.css"

interface VisitorHomeProps {}

const VisitorHome: FC<VisitorHomeProps> = () => {
  return (
    <div className="visitor-home">
      <h1>Welcome</h1>
      <p style={{ fontWeight: "bolder" }}>
        This is ⚔️{" "}
        <span style={{ fontFamily: "Lucida Handwriting" }}>Bulu Chess</span> !
      </p>

      <p>
        🤴 Invented by the ingenious <em>Bruce Wang</em>, Bulu Chess takes the
        classic game of strategy and intellect to exhilarating new heights.
      </p>

      <p>
        🛡️ With a uniquely sized chess board and innovative rules, this game
        promises to challenge even the most seasoned players while offering a
        fresh, exciting experience for newcomers.
      </p>

      <p>
        🪄 Whether you're a chess enthusiast or just looking for a fun new way
        to engage your mind, Bulu Chess invites you to step into a world where
        every move could be your masterpiece. Join us and be among the first to
        experience the next evolution of chess!
      </p>
    </div>
  )
}

export default VisitorHome
