docker build -t test -f ./tasks/integration/dockerfiles/testDockerfile .

echo "starting test database"
docker run -d \
	--name db \
	-p 5432:5432 \
	-e POSTGRES_PASSWORD=test \
	postgres
sleep 4

echo "running test with default autoSync (true)"
docker run \
	--name test-sync \
	--link db:db \
	test
TEST_EC_SYNC=$?

echo "running test with autoSync false"
docker run \
	--name test-no-sync \
	--link db:db \
	test --no-sync
TEST_EC_NO_SYNC=$?

if [ $TEST_EC_SYNC -eq 0 ] && [ $TEST_EC_NO_SYNC -eq 0 ]
then
  echo "It Saul Goodman !";
  exit 0;
else
  exit 1;
fi
