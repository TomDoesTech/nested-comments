import {
  TextInput,
  Button,
  Group,
  Box,
  Notification,
  Container,
  CheckIcon,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useState } from "react";
import { trpc } from "../../utils/trpc";
import RichText from "../../components/RichText";
import { useRouter } from "next/router";
import { showNotification, updateNotification } from "@mantine/notifications";

function CreatePostPage() {
  const router = useRouter();
  const form = useForm({
    initialValues: {
      title: "",
      body: "<p>Your initial <b>html value</b> or an empty string to init editor without value</p>",
    },
  });

  const { isLoading, mutate } = trpc.useMutation(["posts.create-post"], {
    onSuccess(post) {
      updateNotification({
        id: "creating-post",
        color: "teal",
        title: "Post created",
        message: "Post created successfully",
        icon: <CheckIcon />,
        autoClose: 2000,
      });
      router.push(`/posts/${post.permalink}`);
    },
  });

  async function handleSubmit(values: { title: string; body: string }) {
    showNotification({
      id: "creating-post",
      loading: true,
      title: "Creating posts",
      message: "You will be redirected when your post has been created",
      autoClose: false,
      disallowClose: true,
    });

    const { title, body } = values;

    mutate({
      title,
      body,
    });
  }

  return (
    <Container>
      <Box mx="auto">
        <form onSubmit={form.onSubmit(handleSubmit)}>
          <TextInput
            required
            label="Title"
            placeholder="Your post title"
            {...form.getInputProps("title")}
          />

          <RichText
            value="<p>Your initial <b>html value</b> or an empty string to init editor without value</p>"
            onChange={(value) => {
              form.setFieldValue("body", value);
            }}
          />
          <Group position="right" mt="md">
            <Button loading={isLoading} type="submit">
              Create post
            </Button>
          </Group>
        </form>
      </Box>
    </Container>
  );
}

export default CreatePostPage;
