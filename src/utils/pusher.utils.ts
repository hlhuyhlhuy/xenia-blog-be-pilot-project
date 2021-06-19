import Pusher from "pusher";
const pusher = new Pusher({
  appId: "1216393",
  key: "5ee23d2be54abf269991",
  secret: "82a85c27f5ddf5f4259e",
  cluster: "ap1",
  useTLS: true,
});
// pusher.trigger("my-channel", "my-event", {
//   message: "hello world"
// });

export function trigger(channel: string|any, event: string, message: object) {
  return pusher.trigger(channel, event, message);
}
