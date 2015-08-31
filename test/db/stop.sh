docker stop dbadmin;
docker stop db;
docker rm dbadmin;
docker rm -v db;
docker rmi dbadmin;

# want to really clean this mess ?
docker rmi postgres;
docker rmi maxexcloo/phppgadmin;