import { describe, it, expect } from "vitest";
import debug from "./index.js";

describe("debug", () => {
	it("passes a basic sanity check", () => {
		const log = debug("test");
		log.enabled = true;
		log.log = () => {};

		expect(() => log("hello world")).not.toThrowError();
	});

	it("allows namespaces to be a non-string value", () => {
		const log = debug("test");
		log.enabled = true;
		log.log = () => {};

		expect(() => debug.enable(true)).not.toThrowError();
	});

	it("honors global debug namespace enable calls", () => {
		expect(debug("test:12345").enabled).toStrictEqual(false);
		expect(debug("test:67890").enabled).toStrictEqual(false);

		debug.enable("test:12345");
		expect(debug("test:12345").enabled).toStrictEqual(true);
		expect(debug("test:67890").enabled).toStrictEqual(false);
	});

	it("uses custom log function", () => {
		const log = debug("test");
		log.enabled = true;

		const messages = [];
		log.log = (...args) => messages.push(args);

		log("using custom log function");
		log("using custom log function again");
		log("%O", 12345);

		expect(messages.length).toStrictEqual(3);
	});

	describe("extend namespace", () => {
		it("should extend namespace", () => {
			const log = debug("foo");
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend("bar");
			expect(logBar.namespace).toStrictEqual("foo:bar");
		});

		it("should extend namespace with custom delimiter", () => {
			const log = debug("foo");
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend("bar", "--");
			expect(logBar.namespace).toStrictEqual("foo--bar");
		});

		it("should extend namespace with empty delimiter", () => {
			const log = debug("foo");
			log.enabled = true;
			log.log = () => {};

			const logBar = log.extend("bar", "");
			expect(logBar.namespace).toStrictEqual("foobar");
		});

		it("should keep the log function between extensions", () => {
			const log = debug("foo");
			log.log = () => {};

			const logBar = log.extend("bar");
			expect(log.log).toStrictEqual(logBar.log);
		});
	});

	describe("rebuild namespaces string (disable)", () => {
		it("handle names, skips, and wildcards", () => {
			debug.enable("test,abc*,-abc");
			const namespaces = debug.disable();
			expect(namespaces).toStrictEqual("test,abc*,-abc");
		});

		it("handles empty", () => {
			debug.enable("");
			const namespaces = debug.disable();
			expect(namespaces, "");
			expect(debug.names).toStrictEqual([]);
			expect(debug.skips).toStrictEqual([]);
		});

		it("handles all", () => {
			debug.enable("*");
			const namespaces = debug.disable();
			expect(namespaces).toStrictEqual("*");
		});

		it("handles skip all", () => {
			debug.enable("-*");
			const namespaces = debug.disable();
			expect(namespaces).toStrictEqual("-*");
		});

		it("names+skips same with new string", () => {
			debug.enable("test,abc*,-abc");
			const oldNames = [...debug.names];
			const oldSkips = [...debug.skips];
			const namespaces = debug.disable();
			expect(namespaces).toStrictEqual("test,abc*,-abc");
			debug.enable(namespaces);
			expect(oldNames.map(String)).toStrictEqual(debug.names.map(String));
			expect(oldSkips.map(String)).toStrictEqual(debug.skips.map(String));
		});

		it("handles re-enabling existing instances", () => {
			debug.disable();
			const inst = debug("foo");
			const messages: string[] = [];
			inst.log = (msg) =>
				messages.push(msg.replace(/^[^@]*@([^@]+)@.*$/, "$1"));

			inst("@test@");
			expect(messages).toStrictEqual([]);
			debug.enable("foo");
			expect(messages).toStrictEqual([]);
			inst("@test2@");
			expect(messages).toStrictEqual(["test2"]);
			inst("@test3@");
			expect(messages).toStrictEqual(["test2", "test3"]);
			debug.disable();
			inst("@test4@");
			expect(messages).toStrictEqual(["test2", "test3"]);
		});
	});
});
