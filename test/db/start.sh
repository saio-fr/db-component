docker pull postgres;
docker run -d \
	--name db \
	-p 5444:5432 \
	-e POSTGRES_PASSWORD=test \
	postgres;
docker build -t dbadmin test/db/phppgadmin/;
docker run -d \
	--name dbadmin \
	-p 8080:80 \
	--link db:postgresql \
	dbadmin;
sleep 2;
