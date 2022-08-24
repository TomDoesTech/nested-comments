import { Box, Button, Group, Textarea } from "@mantine/core";
import { useForm } from "@mantine/form";
import { useRouter } from "next/router";
import { trpc } from "../../utils/trpc";

function CommentForm({ parentId }: { parentId?: string }) {
  const router = useRouter();

  const permalink = router.query.permalink as string;

  const form = useForm({
    initialValues: {
      body: "",
    },
  });

  const utils = trpc.useContext();

  const { mutate, isLoading } = trpc.useMutation(["comments.add-comment"], {
    onSuccess: () => {
      form.reset();

      utils.invalidateQueries([
        "comments.all-comments",
        {
          permalink,
        },
      ]);
    },
  });

  function handleSubmit(values: { body: string }) {
    const payload = {
      ...values,
      permalink,
      parentId,
    };

    mutate(payload);
  }

  return (
    <Box mt="md" mb="md">
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Textarea
          required
          placeholder="Your spicey comment"
          label="Comment"
          {...form.getInputProps("body")}
        />

        <Group position="right" mt="md">
          <Button loading={isLoading} type="submit">
            {parentId ? "Post reply" : "Post comment"}
          </Button>
        </Group>
      </form>
    </Box>
  );
}

export default CommentForm;
