import { Box } from "@mantine/core";
import { useRouter } from "next/router";
import formComments from "../../helpers/formatComments";
import { trpc } from "../../utils/trpc";
import CommentForm from "./CommentForm";
import ListComments from "./ListComments";

function CommentSection() {
  const router = useRouter();

  const permalink = router.query.permalink as string;

  const { data } = trpc.useQuery([
    "comments.all-comments",
    {
      permalink,
    },
  ]);

  return (
    <Box>
      <CommentForm />
      {data && <ListComments comments={formComments(data || [])} />}
    </Box>
  );
}

export default CommentSection;
