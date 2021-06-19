type Executor<T> = (
  resolve: (result: T) => void,
  reject: (error: unknown) => void
) => void;

export class MyPromise<T> {
  private state: "pending" | "fulfilled" | "rejected" = "pending";
  private value!: T;
  private error!: unknown;
  private onResolved?: (res: T) => void;
  private onRejected?: (err: unknown) => void;

  constructor(f: Executor<T>) {
    f(
      (result) => {
        this.value = result;
        this.state = "fulfilled";
        if (this.onResolved) {
          this.onResolved(result);
        }
        return this;
      },
      (error) => {
        this.error = error;
        this.state = "rejected";
        if (this.onRejected) {
          this.onRejected(error);
        }
        return this;
      }
    );
  }

  then<U>(g: (result: T) => MyPromise<U> | U): MyPromise<U> {
    const t = this;
    return new MyPromise(function (resolve, reject) {
      t.onResolved = (res) => {
        try {
          const r = g(res);
          if (r instanceof MyPromise) {
            resolve(r.value);
            return r;
          } else {
            resolve(r);
          }
        } catch (e) {
          reject(e);
        }
      };
    });
  }

  catch<U>(g: (error: unknown) => MyPromise<U> | U): MyPromise<U> {
    const t = this;
    return new MyPromise(function (resolve, reject) {
      t.onRejected = (res) => {
        try {
          const e = g(res);
          if (e instanceof MyPromise) {
            resolve(e.value);
            return e;
          } else {
            resolve(e);
          }
        } catch (e) {
          reject(e);
        }
      };
    });
  }
}

function main() {
  new MyPromise((resolve) => {
    setTimeout(() => {
      console.log("hello");
      resolve(1);
    }, 3000);
  })
    .then((v) => {
      console.log("hello world then1:", v);
      return 2;
    })
    .then((v) =>
      setTimeout(() => {
        console.log("then2:", v);
      }, 1000)
    )
    .then(() => {
      throw new Error("kowareta-");
    })
    .catch((e) => console.log(e));
}

main();
