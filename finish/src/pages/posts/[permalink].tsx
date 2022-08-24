import { Container, Title, Skeleton, Text } from "@mantine/core";
import { useRouter } from "next/router";
import CommentSection from "../../components/comment/CommentSection";
import { trpc } from "../../utils/trpc";

function PostPage() {
  const router = useRouter();

  const permalink = router.query.permalink as string;

  const { data: postData, isLoading } = trpc.useQuery([
    "posts.find-by-permalink",
    {
      permalink,
    },
  ]);

  return (
    <Container>
      <Skeleton visible={isLoading}>
        <Title>{postData?.title}</Title>
      </Skeleton>

      <Skeleton visible={isLoading}>
        <Text>
          <span>
            Posted by {postData?.user.name} at{" "}
            {postData?.createdAt.toLocaleDateString("en-AU", {
              dateStyle: "medium",
            })}
          </span>
        </Text>
      </Skeleton>

      <Skeleton visible={isLoading}>
        <div dangerouslySetInnerHTML={{ __html: postData?.body || "" }} />
      </Skeleton>

      <CommentSection />
    </Container>
  );
}

export default PostPage;
